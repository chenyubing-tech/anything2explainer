import React from 'react';
import type {ShotDef} from './types';
import type {FootageSpec} from './Footage';
import {FootageClip} from './Footage';
import type {SceneSpec} from './sceneTypes';

/** 1-based inclusive legacy ranges become 0-based half-open scene ranges. */
export const sceneFromShot = (shot: ShotDef): SceneSpec => ({
  id: shot.id, start: shot.from - 1, duration: shot.to - shot.from + 1,
  layers: [{id: `${shot.id}-content`, kind: 'graphic', role: 'subject', order: 0, Comp: shot.Comp}],
});

/** Keeps legacy crop/blur/grade/keyframes. Scene boundaries own transitions, not this clip. */
export const sceneFromFootage = (clip: FootageSpec): SceneSpec => {
  const clean = {...clip, transitionIn: undefined, transitionOut: undefined};
  const Content: React.FC = () => <FootageClip spec={clean} />;
  const id = clip.id ?? `footage-${clip.from}`;
  return {id, start: clip.from - 1, duration: clip.to - clip.from + 1,
    layers: [{id: `${id}-content`, kind: 'graphic', role: 'subject', order: 0, Comp: Content}]};
};
