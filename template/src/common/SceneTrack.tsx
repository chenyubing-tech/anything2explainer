import React from 'react';
import {AbsoluteFill, Freeze, Img, OffthreadVideo, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import type {CompiledScene, SceneLayer, ScenePlan} from './sceneTypes';
import {boundaryProgress, clampFrame, easeProgress, motionAt, revealClip} from './sceneTimeline';
import {BACKGROUND} from '../theme';

const Layer: React.FC<{layer: SceneLayer}> = ({layer}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const motion = motionAt(frame, layer.motion);
  const viewport = layer.viewport;
  const content = motionAt(frame, layer.kind === 'graphic' ? undefined : layer.contentMotion);
  const mediaStyle: React.CSSProperties = {width: '100%', height: '100%', objectFit: layer.kind === 'graphic' ? undefined : layer.fit ?? 'cover',
    objectPosition: layer.kind === 'graphic' ? undefined : layer.focus ?? '50% 50%', filter: layer.kind === 'graphic' ? undefined : layer.filter,
    opacity: content.opacity, transform: `translate(${content.x}px,${content.y}px) scale(${content.scale}) rotate(${content.rotate}deg)`};
  return <div style={{position: 'absolute', left: viewport?.x ?? 0, top: viewport?.y ?? 0, width: viewport?.width ?? '100%', height: viewport?.height ?? '100%',
    overflow: 'hidden', borderRadius: viewport?.radius ?? 0, zIndex: layer.order, opacity: motion.opacity,
    transform: `translate(${motion.x}px,${motion.y}px) scale(${motion.scale}) rotate(${motion.rotate}deg)`}}>
    {layer.kind === 'image' ? <Img src={staticFile(layer.src)} style={mediaStyle} /> : null}
    {layer.kind === 'video' ? <OffthreadVideo src={staticFile(layer.src)} trimBefore={Math.round(layer.sourceInSeconds * fps)} playbackRate={layer.playbackRate ?? 1} muted style={mediaStyle} /> : null}
    {layer.kind === 'graphic' ? <layer.Comp /> : null}
  </div>;
};

const Surface: React.FC<{compiled: CompiledScene}> = ({compiled}) => {
  // This component receives the global clock. Nested Freeze supplies the nominal local clock.
  const frame = useCurrentFrame();
  const {scene, incoming} = compiled;
  const local = clampFrame(frame - scene.start, scene.duration);
  const camera = motionAt(local, scene.camera);
  const p = incoming ? easeProgress(boundaryProgress(frame, incoming)) : 1;
  return <AbsoluteFill style={{background: scene.background ?? BACKGROUND,
    opacity: incoming?.preset === 'dissolve' ? p : 1,
    clipPath: incoming?.preset === 'reveal' ? revealClip(p, incoming.direction) : undefined, overflow: 'hidden'}}>
    <Freeze frame={local}>
      <AbsoluteFill style={{opacity: camera.opacity, transform: `translate(${camera.x}px,${camera.y}px) scale(${camera.scale}) rotate(${camera.rotate}deg)`}}>
        {scene.layers.map((layer) => <Layer key={layer.id} layer={layer} />)}
      </AbsoluteFill>
    </Freeze>
  </AbsoluteFill>;
};

/** Outgoing full surface stays opaque; only the incoming surface fades/reveals over it. */
export const SceneTrack: React.FC<{plan: ScenePlan}> = ({plan}) => {
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  if (fps !== plan.fps || durationInFrames !== plan.totalFrames) throw new Error('Scene plan must match composition fps and duration');
  return <AbsoluteFill>{plan.scenes.filter((s) => frame >= s.renderStart && frame < s.renderEnd).map((s) => <Surface key={s.scene.id} compiled={s} />)}</AbsoluteFill>;
};
