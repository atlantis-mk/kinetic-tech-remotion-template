import type {ComponentType} from "react"
import {Architecture} from "../scenes/Architecture"
import {Chapters} from "../scenes/Chapters"
import {ChipScene} from "../scenes/ChipScene"
import {DateScene} from "../scenes/DateScene"
import {HeadlinesScene} from "../scenes/HeadlinesScene"
import {Intertitle} from "../scenes/Intertitle"
import {MediaScene} from "../scenes/MediaScene"
import {PercentScene} from "../scenes/PercentScene"
import {ThesisScene} from "../scenes/ThesisScene"
import {WeightsScene} from "../scenes/WeightsScene"

export const KNOWN_KINDS = [
  "chip",
  "percentage",
  "system",
  "architecture",
  "chapters",
  "thesis",
  "intertitle",
  "headlines",
  "weights",
  "media",
] as const

export type KnownKind = (typeof KNOWN_KINDS)[number]

export function assertKnownKind(kind: string): KnownKind {
  if (!(KNOWN_KINDS as readonly string[]).includes(kind)) {
    throw new Error(`Unknown scene kind: ${kind}`)
  }
  return kind as KnownKind
}

export const SCENE_COMPONENTS = {
  chip: ChipScene,
  percentage: PercentScene,
  system: DateScene,
  architecture: Architecture,
  chapters: Chapters,
  thesis: ThesisScene,
  intertitle: Intertitle,
  headlines: HeadlinesScene,
  weights: WeightsScene,
  media: MediaScene,
} as const satisfies Record<KnownKind, ComponentType<any>>

export function getSceneComponent(kind: string): ComponentType<any> {
  const known = assertKnownKind(kind)
  const component = SCENE_COMPONENTS[known]
  if (!component) throw new Error(`Unknown scene kind: ${kind}`)
  return component
}
