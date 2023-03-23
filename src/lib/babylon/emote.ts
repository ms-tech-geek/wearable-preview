import { EventEmitter } from 'events'
import { AnimationGroup, ArcRotateCamera, AssetContainer, Scene, TransformNode, Vector3 } from '@babylonjs/core'
import {
  IEmoteController,
  PreviewCamera,
  PreviewConfig,
  PreviewEmote,
  EmoteDefinition,
  PreviewEmoteEventType,
} from '@dcl/schemas'
import { isEmote } from '../emote'
import { startAutoRotateBehavior } from './camera'
import { Asset, loadAssetContainer } from './scene'
import { getEmoteRepresentation } from '../representation'

const loopedEmotes = [PreviewEmote.IDLE, PreviewEmote.MONEY, PreviewEmote.CLAP]

let intervalId: number | undefined

function isLooped(emote: PreviewEmote) {
  return loopedEmotes.includes(emote)
}

export function buildEmoteUrl(emote: PreviewEmote) {
  let baseUrl = process.env.PUBLIC_URL || ''
  if (!baseUrl.endsWith('/')) {
    baseUrl += '/'
  }
  const path = `./emotes/${emote}.glb`
  const url = baseUrl.startsWith('http') ? new URL(path, baseUrl).href : path
  return url
}

export async function loadEmoteFromUrl(scene: Scene, url: string) {
  const container = await loadAssetContainer(scene, url)
  if (container.animationGroups.length === 0) {
    throw new Error(`No animation groups found for emote with url=${url}`)
  }
  return container
}

export async function loadEmoteFromWearable(scene: Scene, emote: EmoteDefinition, config: PreviewConfig) {
  const representation = getEmoteRepresentation(emote, config.bodyShape)
  const content = representation.contents.find((content) => content.key === representation.mainFile)
  if (!content) {
    throw new Error(
      `Could not find a valid content in representation for emote=${emote.id} and bodyShape=${config.bodyShape}`
    )
  }
  return loadEmoteFromUrl(scene, content.url)
}

export async function playEmote(scene: Scene, assets: Asset[], config: PreviewConfig) {
  // load asset container for emote
  let container: AssetContainer | undefined
  let loop = !!config.emote && isLooped(config.emote)

  // if target item is emote, play that one
  if (config.item && isEmote(config.item)) {
    try {
      container = await loadEmoteFromWearable(scene, config.item as EmoteDefinition, config)
      loop = config.item.emoteDataADR74.loop
    } catch (error) {
      console.warn(`Could not load emote=${config.item.id}`)
    }
  }
  if (!container && config.emote) {
    const emoteUrl = buildEmoteUrl(config.emote)
    container = await loadEmoteFromUrl(scene, emoteUrl)
  }

  const emoteAnimationGroup = new AnimationGroup('emote', scene)

  // start camera rotation after animation ends
  function onAnimationEnd() {
    if (config.camera !== PreviewCamera.STATIC) {
      const camera = scene.cameras[0] as ArcRotateCamera
      startAutoRotateBehavior(camera, config)
    }
  }

  // play emote animation
  try {
    for (const asset of assets) {
      // store all the transform nodes in a map, there can be repeated node ids
      // if a wearable has multiple representations, so for each id we keep an array of nodes
      const nodes = asset.container.transformNodes.reduce((map, node) => {
        const list = map.get(node.id) || []
        list.push(node)
        // Initialize position when starting an animation to avoid wearables misplaced
        if (container && config.emote) {
          node.position = new Vector3(0, 0, 0)
        }
        return map.set(node.id, list)
      }, new Map<string, TransformNode[]>())
      // apply each targeted animation from the emote asset container to the transform nodes of all the wearables
      if (container && container.animationGroups.length > 0) {
        for (const targetedAnimation of container.animationGroups[0].targetedAnimations) {
          const animation = targetedAnimation.animation
          const target = targetedAnimation.target as TransformNode
          const newTargets = nodes.get(target.id)
          if (newTargets && newTargets.length > 0) {
            for (const newTarget of newTargets) {
              emoteAnimationGroup.addTargetedAnimation(animation, newTarget)
            }
          }
        }
      }
    }
    // play animation group and apply
    emoteAnimationGroup.onAnimationGroupEndObservable.addOnce(onAnimationEnd)
    const controller = createController(emoteAnimationGroup, loop)

    if (config.camera === PreviewCamera.STATIC) {
      controller.stop() // we call the stop here to freeze the animation at frame 0, otherwise the avatar would be on T-pose
    }

    return controller
  } catch (error) {
    console.warn(`Could not play emote=${config.emote}`, error)
  }
}

function createController(animationGroup: AnimationGroup, loop: boolean): IEmoteController {
  let startFrom = 0
  let fromGoTo = false

  async function getLength() {
    // if there's no animation, it should return 0
    return Math.max(animationGroup.to, 0)
  }

  async function isPlaying() {
    return animationGroup.isPlaying
  }

  async function goTo(seconds: number) {
    fromGoTo = true
    if (await isPlaying()) {
      animationGroup.pause()
      goTo(seconds)
      window.requestAnimationFrame(play)
    } else {
      // for some reason the start() method doesn't work as expected if playing, so I need to stop it first
      animationGroup.stop()
      // I had to use this hack because the native goToFrame would not work as expected :/
      animationGroup.start(false, 1, seconds, seconds, false)
      startFrom = seconds
      // Set again the fromGoTo here because the `stop` event is emitted twice
      fromGoTo = true
    }
  }

  async function play() {
    if (!(await isPlaying())) {
      if (startFrom) {
        animationGroup.start(loop, 1, startFrom, await getLength(), false)
        startFrom = 0
      } else {
        animationGroup.play(loop)
      }
    }
  }

  async function pause() {
    if (await isPlaying()) {
      animationGroup.pause()
    }
  }

  async function stop() {
    animationGroup.goToFrame(0)
    animationGroup.stop()
  }

  const events = new EventEmitter()

  // Emit the PreviewEmoteEventType.ANIMATION_PLAYING event with the current playing frame
  const emitPlayingEvent = () => {
    if (intervalId) {
      clearInterval(intervalId)
    }
    return window.setInterval(async () => {
      // Avoid emitting the event when the animation is paused or using GoTo because the masterFrame returns 0 for each request
      if ((await isPlaying()) && animationGroup.animatables[0].masterFrame > 0) {
        return events.emit(PreviewEmoteEventType.ANIMATION_PLAYING, {
          length: animationGroup.animatables[0]?.masterFrame,
        })
      }
    }, 10)
  }

  const clearEmitPlayingEvent = () => {
    clearInterval(intervalId)
    if (!fromGoTo) {
      events.emit(PreviewEmoteEventType.ANIMATION_PLAYING, {
        length: animationGroup.to,
      })
    }
  }

  // forward observable events to event emitter
  animationGroup.onAnimationGroupPlayObservable.add(() => {
    intervalId = emitPlayingEvent()
    return events.emit(PreviewEmoteEventType.ANIMATION_PLAY)
  })
  animationGroup.onAnimationGroupPauseObservable.add(() => events.emit(PreviewEmoteEventType.ANIMATION_PAUSE))
  animationGroup.onAnimationGroupLoopObservable.add(() => {
    // It's required to stop and start a looping animation again from 0 when using the Go To feature,
    // otherwise the animation will continue playing from the GoTo chosen frame
    if (fromGoTo) {
      stop()
      play()
      fromGoTo = false
    }
    return events.emit(PreviewEmoteEventType.ANIMATION_LOOP)
  })
  animationGroup.onAnimationGroupEndObservable.add(() => {
    // Send the last frame when the animation ends and the event: end is not emitted by a goTo
    clearEmitPlayingEvent()
    if (!loop) {
      fromGoTo = false
    }
    return events.emit(PreviewEmoteEventType.ANIMATION_END)
  })

  return {
    getLength,
    isPlaying,
    goTo,
    play,
    pause,
    stop,
    events,
  }
}
