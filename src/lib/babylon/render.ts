import { Color3, Color4, DynamicTexture, Scene, Texture } from '@babylonjs/core'
import {
  PreviewConfig,
  PreviewType,
  BodyShape,
  IPreviewController,
  IEmoteController,
  WearableCategory,
} from '@dcl/schemas'
import { createInvalidEmoteController, isEmote } from '../emote'
import { getBodyShape } from './body'
import { getSlots } from './slots'
import { playEmote } from './emote'
import { applyFacialFeatures, getFacialFeatures } from './face'
import { setupMappings } from './mappings'
import { Asset, center, createScene } from './scene'
import { isFacialFeature, isModel, isSuccesful } from './utils'
import { loadWearable } from './wearable'
import { createShaderMaterial } from './explorer-alpha-shader'
import { createOutlineShader } from './explorer-alpha-shader/OutlineShader'
import { isTextureFile } from '../representation'

/**
 * Initializes Babylon, creates the scene and loads a list of wearables in it
 * @param canvas
 * @param wearables
 * @param options
 */

function createTexture(scene: Scene, hexColor: string) {
  const texture = new DynamicTexture('dynamicTexture', { width: 512, height: 512 }, scene)
  const context = texture.getContext()

  const color = Color3.FromHexString(hexColor).toLinearSpace()
  context.fillStyle = `rgba(${Math.floor(color.r * 255)}, ${Math.floor(color.g * 255)}, ${Math.floor(
    color.b * 255
  )}, 1)`
  context.fillRect(0, 0, 512, 512)
  texture.update()

  return texture
}

function applyMaterialToMeshes(asset: any, material: any, scene: Scene) {
  asset?.container?.meshes.forEach((mesh: any) => {
    mesh.material = material
    mesh.computeBonesUsingShaders = false
    scene.addMesh(mesh)
  })
}

export async function render(canvas: HTMLCanvasElement, config: PreviewConfig): Promise<IPreviewController> {
  // create the root scene
  const [scene, sceneController, engine] = await createScene(canvas, config)

  const outlineShaderMaterial = createOutlineShader(scene, 'outline')

  try {
    // setup the mappings for all the contents
    setupMappings(config)

    // emote controller
    let emoteController: IEmoteController

    // create promises for both avatars
    const avatarPromises: Promise<void | Asset>[] = []

    if (config.type === PreviewType.AVATAR) {
      // get slots
      const slots = getSlots(config)

      // get wearables
      const wearables = Array.from(slots.values())

      //load wearables
      for (const wearable of wearables.filter(isModel)) {
        const promise = loadWearable(scene, wearable, config.bodyShape, config.skin, config.hair).catch((error) => {
          console.warn(error.message)
        })
        avatarPromises?.push(promise)
      }

      const assets = (await Promise.all(avatarPromises)).filter(isSuccesful)

      // load assets in scene using shader Material
      for (const asset of assets) {
        const category = asset?.wearable?.data?.category
        const contents = asset?.wearable?.data?.representations[0]?.contents

        let material, texture, content;

        switch (category) {
          case WearableCategory.BODY_SHAPE:
            material = createShaderMaterial(scene, WearableCategory.BODY_SHAPE)
            texture = createTexture(scene, config.skin)
            material.setTexture('textureSampler', texture)
            material.setInt('materialType', 0)
            material.setFloat('alpha', 0.7)
            break
          case WearableCategory.HAIR:
            material = createShaderMaterial(scene, WearableCategory.HAIR)
            texture = createTexture(scene, config.hair)
            material.setTexture('textureSampler', texture)
            material.setInt('materialType', 0)
            material.setFloat('alpha', 1)
            break
          case WearableCategory.UPPER_BODY:
            content = contents.find((content) => isTextureFile(content?.key))
            const upperMainTexture = new Texture(content?.url || '', scene)
            material = createShaderMaterial(scene, WearableCategory.UPPER_BODY)
            material.setTexture('textureSampler', upperMainTexture)
            break
          case WearableCategory.LOWER_BODY:
            content = contents.find((content) => isTextureFile(content?.key))
            const pantsMainTex = new Texture(content?.url || '', scene)
            material = createShaderMaterial(scene, WearableCategory.LOWER_BODY)
            material.setTexture('textureSampler', pantsMainTex)
            break
          case WearableCategory.FEET:
            content = contents.find((content) => isTextureFile(content?.key))
            const feetMainTex = new Texture(content?.url || '', scene)
            material = createShaderMaterial(scene, WearableCategory.FEET)
            material.setTexture('textureSampler', feetMainTex)
            material.setInt('materialType', 2)
            break

          default:
            console.warn(`Unhandled category: ${category}`)
            continue
        }

        if (material) {
          applyMaterialToMeshes(asset, material, scene)
        }
      }
      
      // build avatar
      const bodyShape = getBodyShape(assets)
      if (bodyShape) {
        // apply facial features
        const features = wearables.filter(isFacialFeature)
        const { eyes, eyebrows, mouth } = await getFacialFeatures(scene, features, config.bodyShape)
        applyFacialFeatures(scene, bodyShape, eyes, eyebrows, mouth, config)
      }

      // play emote
      emoteController = (await playEmote(scene, assets, config)) || createInvalidEmoteController() // default to invalid emote controller if there is an issue with the emote, but let the rest of the preview keep working
    } else {
      const wearable = config.item
      if (wearable && !isEmote(wearable)) {
        try {
          // try loading with the required body shape
          const asset = await loadWearable(scene, wearable, config.bodyShape, config.skin, config.hair)
          asset.container.addAllToScene()
        } catch (error) {
          // default to other body shape if failed
          const asset = await loadWearable(
            scene,
            wearable,
            config.bodyShape === BodyShape.MALE ? BodyShape.FEMALE : BodyShape.MALE,
            config.skin,
            config.hair
          )
          asset.container.addAllToScene()
        }
      }

      // can't use emote controller if PreviewType is not "avatar"
      emoteController = createInvalidEmoteController()
    }

    scene.getOutlineRenderer()

    // milestone 2
    const meshIDsToOutline = [
      'M_Hair_Standard_01',
      'M_uBody_Hoodie_01',
      'M_uBody_Hoodie_02',
      'M_lBody_LongPants_01_primitive0',
      'M_lBody_LongPants_01_primitive1',
      'M_Feet_Sneakers_01_primitive0',
      'M_Feet_Sneakers_02',
    ]

    // options could be new-avatar, outline, both, old
    const renderMode: any = 'new-avatar'

    engine.runRenderLoop(() => {
      switch (renderMode) {
        case 'outline':
          outlineShaderMaterial.backFaceCulling = false
          outlineShaderMaterial.setColor4('_BaseColor', new Color4(1, 0.75, 0.8, 1))
          for (const mesh of scene.meshes) {
            if (meshIDsToOutline?.includes(mesh?.id)) {
              mesh.material = outlineShaderMaterial // Assign the outline shader material
            }
          }
          engine.clear(scene.clearColor, true, true)
          scene.render()
          break
        case 'new-avatar':
          scene.render()
          break
        case 'old':
          scene.render()
          break
        default:
          console.warn(`Unknown render mode: ${renderMode}`)
          break
      }
    })

    // center the root scene into the camera
    if (config.centerBoundingBox) {
      center(scene)
    }

    // return preview controller
    const controller: IPreviewController = {
      scene: sceneController,
      emote: emoteController,
    }
    return controller
  } catch (error) {
    // remove background on error
    scene.clearColor = new Color4(0, 0, 0, 0)
    throw error
  }
}
