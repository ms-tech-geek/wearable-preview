import {
  BodyShape,
  RepresentationDefinition,
  WearableDefinition,
  EmoteDefinition,
  EmoteRepresentationDefinition,
} from '@dcl/schemas'
import { isEmote } from './emote'
import { isWearable } from './wearable'

export function is(representation: RepresentationDefinition | EmoteRepresentationDefinition, bodyShape: BodyShape) {
  return representation.bodyShapes.includes(bodyShape)
}

export function isMale(representation: RepresentationDefinition | EmoteRepresentationDefinition) {
  return is(representation, BodyShape.MALE)
}

export function isFemale(representation: RepresentationDefinition | EmoteRepresentationDefinition) {
  return is(representation, BodyShape.FEMALE)
}

export function getRepresentation(wearable: WearableDefinition | EmoteDefinition, shape = BodyShape.MALE) {
  const isWearableDefinition = isWearable(wearable)
  switch (shape) {
    case BodyShape.FEMALE: {
      if (
        isWearableDefinition
          ? !wearable.data.representations.some(isFemale)
          : !wearable.emoteDataADR74.representations.some(isFemale)
      ) {
        throw new Error(`Could not find a BaseFemale representation for wearable="${wearable.id}"`)
      }
      return isWearableDefinition
        ? wearable.data.representations.find(isFemale)!
        : wearable.emoteDataADR74.representations.find(isFemale)!
    }
    case BodyShape.MALE: {
      if (
        isWearableDefinition
          ? !wearable.data.representations.some(isMale)
          : !wearable.emoteDataADR74.representations.some(isMale)
      ) {
        throw new Error(`Could not find a BaseMale representation for wearable="${wearable.id}"`)
      }
      return isWearableDefinition
        ? wearable.data.representations.find(isMale)!
        : wearable.emoteDataADR74.representations.find(isMale)!
    }
  }
}

export function getRepresentationOrDefault(definition: WearableDefinition | EmoteDefinition, shape = BodyShape.MALE) {
  if (hasRepresentation(definition, shape)) {
    return getRepresentation(definition, shape)
  }
  if (isEmote(definition)) {
    if (definition.emoteDataADR74.representations.length > 0) {
      return definition.emoteDataADR74.representations[0]
    }
  } else if (definition.data.representations.length > 0) {
    return definition.data.representations[0]
  }
  throw new Error(`The wearable="${definition.id}" has no representation`)
}

export function hasRepresentation(definition: WearableDefinition | EmoteDefinition, shape = BodyShape.MALE) {
  try {
    getRepresentation(definition, shape)
    return true
  } catch (error) {
    return false
  }
}

export function getContentUrl(representation: RepresentationDefinition | EmoteRepresentationDefinition) {
  const content = representation.contents.find((content) => content.key === representation.mainFile)
  if (!content) {
    throw new Error(`Could not find main file`)
  }
  return content.url
}

export function isTexture(representation: RepresentationDefinition) {
  return representation.mainFile.endsWith('png')
}
