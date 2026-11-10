import type React from 'react';

export type MotionKey = {frame: number; x?: number; y?: number; scale?: number; rotate?: number; opacity?: number};
export type Viewport = {x: number; y: number; width: number; height: number; radius?: number};
type LayerBase = {
  id: string;
  role: 'subject' | 'environment' | 'annotation';
  order: number;
  viewport?: Viewport;
  motion?: MotionKey[];
};
type MediaBase = LayerBase & {src: string; fit?: 'cover' | 'contain'; focus?: string; filter?: string};
export type ImageSceneLayer = MediaBase & {kind: 'image'};
export type VideoSceneLayer = MediaBase & {
  kind: 'video';
  /** Seconds in the original source; trimBefore is converted using composition fps. */
  sourceInSeconds: number;
  sourceDurationSeconds: number;
  sourceFps: number;
  playbackRate?: number;
};
export type GraphicSceneLayer = LayerBase & {kind: 'graphic'; Comp: React.FC};
export type SceneLayer = ImageSceneLayer | VideoSceneLayer | GraphicSceneLayer;
export type SceneBeat = {at: number; duration: number; subject: string; action: string};
/** Internal timing is zero-based, half-open. Extensions do not change nominal duration. */
export type SceneSpec = {
  id: string;
  start: number;
  duration: number;
  background?: string;
  layers: SceneLayer[];
  beats?: SceneBeat[];
  camera?: MotionKey[];
};
export type BoundarySpec = {
  fromScene: string;
  toScene: string;
  /** Total transition length, not a length per side. Default: 18 frames. */
  durationFrames?: number;
  preset: 'cut' | 'dissolve' | 'reveal';
  direction?: 'left' | 'right' | 'up' | 'down';
};
export type CompiledBoundary = BoundarySpec & {at: number; start: number; end: number; durationFrames: number};
export type CompiledScene = {scene: SceneSpec; renderStart: number; renderEnd: number; incoming?: CompiledBoundary};
export type ScenePlan = {scenes: CompiledScene[]; boundaries: CompiledBoundary[]; totalFrames: number; fps: number};
