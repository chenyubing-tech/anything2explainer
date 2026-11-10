import React from 'react';
import {AbsoluteFill, Freeze, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {W, H, clamp, keyframes, DirBlur} from './lib';
import type {TransitionDirection, TransitionSpec} from './types';
import {clampFrame, transitionWindow} from './sceneTimeline';

/**
 * 实拍/B-roll 层（可选）。素材只能来自 public/assets/<slug>/（免版权来源如 Mixkit，登记 MANIFEST.md：sha256 / 来源 URL / 许可 / 用途）。
 * spec.from/to 为成片帧号；zoom/pan/blur/opacity 关键帧 t 为成片帧号。
 */
export type FootageSpec = {
  id?: string;
  reuseKey?: string;
  from: number; to: number;
  src: string; // 相对 public/
  srcFrom: number; // 素材起始帧（30fps，0 起）
  zoomKf?: Array<[number, number]>; panKf?: Array<[number, number]>; panYKf?: Array<[number, number]>;
  blurKf?: Array<[number, number]>; focusKf?: Array<[number, number]>; opacityKf?: Array<[number, number]>;
  originX?: number; originY?: number; flipX?: boolean;
  grade?: 'dark' | 'none';
  filter?: string;
  transitionIn?: TransitionSpec;
  transitionOut?: TransitionSpec;
};
const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));
const durationOf = (spec: TransitionSpec | undefined) => spec ? transitionWindow(0, spec.duration ?? 18).duration : 0;
const directionOf = (spec: TransitionSpec | undefined, fallback: TransitionDirection) => spec?.direction ?? fallback;
const transitionMask = (inK: number, outK: number, incoming?: TransitionSpec, outgoing?: TransitionSpec): string | undefined => {
  const reveal = incoming ? inK : 1;
  const exit = outgoing ? outK : 1;
  const direction = reveal < 1 ? directionOf(incoming, 'left') : directionOf(outgoing, 'right');
  if (reveal < 1) {
    if (direction === 'right') return `inset(0 0 0 ${((1 - reveal) * 100).toFixed(2)}%)`;
    if (direction === 'up') return `inset(${((1 - reveal) * 100).toFixed(2)}% 0 0 0)`;
    if (direction === 'down') return `inset(0 0 ${((1 - reveal) * 100).toFixed(2)}% 0)`;
    return `inset(0 ${((1 - reveal) * 100).toFixed(2)}% 0 0)`;
  }
  if (exit < 1) {
    if (direction === 'right') return `inset(0 0 0 ${((1 - exit) * 100).toFixed(2)}%)`;
    if (direction === 'up') return `inset(${((1 - exit) * 100).toFixed(2)}% 0 0 0)`;
    if (direction === 'down') return `inset(0 0 ${((1 - exit) * 100).toFixed(2)}% 0)`;
    return `inset(0 ${((1 - exit) * 100).toFixed(2)}% 0 0)`;
  }
  return undefined;
};
/** 低照深海调 + 暗角（让生成视频融入黑金画面） */
export const DarkGrade: React.FC = () => (
  <>
    <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(16,24,33,0.20), rgba(10,15,22,0.42))', mixBlendMode: 'multiply', pointerEvents: 'none'}} />
    <AbsoluteFill style={{background: 'radial-gradient(ellipse 100% 95% at 50% 50%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.6) 100%)', pointerEvents: 'none'}} />
  </>
);
const FootageBody: React.FC<{spec: FootageSpec}> = ({spec}) => {
  const N = spec.from + useCurrentFrame();
  const scale = spec.zoomKf ? keyframes(N, spec.zoomKf) : 1;
  const pan = spec.panKf ? keyframes(N, spec.panKf) : 0;
  const panY = spec.panYKf ? keyframes(N, spec.panYKf) : 0;
  const blur = spec.blurKf ? keyframes(N, spec.blurKf) : 0;
  const focus = spec.focusKf ? keyframes(N, spec.focusKf) : 0;
  const baseOpacity = spec.opacityKf ? keyframes(N, spec.opacityKf) : 1;
  const opacity = baseOpacity;
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity, background: '#101821'}}>
      <DirBlur bx={blur + focus} by={blur * 0.15 + focus}>
        <AbsoluteFill style={{transform: `translate(${pan}px, ${panY}px) scale(${scale})${spec.flipX ? ' scaleX(-1)' : ''}`, transformOrigin: `${spec.originX ?? 640}px ${spec.originY ?? 360}px`}}>
          <OffthreadVideo src={staticFile(spec.src)} trimBefore={spec.srcFrom} muted style={{width: W, height: H, objectFit: 'cover', filter: spec.filter ?? 'saturate(0.84) contrast(1.08) brightness(0.88)'}} />
        </AbsoluteFill>
      </DirBlur>
      {(spec.grade ?? 'dark') === 'dark' ? <DarkGrade /> : null}
    </AbsoluteFill>
  );
};
/** Legacy footage only. New scene mode coordinates both code and media at SceneTrack. */
export const FootageClip: React.FC<{spec: FootageSpec}> = ({spec}) => {
  const incoming = transitionWindow(spec.from, durationOf(spec.transitionIn));
  const outgoing = transitionWindow(spec.to + 1, durationOf(spec.transitionOut));
  const local = useCurrentFrame() - incoming.pre;
  const N = spec.from + local;
  const progress = (start: number, at: number, duration: number) => duration <= 1 ? Number(N >= at) : clamp((N - start) / (duration - 1), 0, 1);
  const inK = spec.transitionIn ? ease(progress(incoming.start, spec.from, incoming.duration)) : 1;
  const outK = spec.transitionOut ? 1 - ease(progress(outgoing.start, spec.to + 1, outgoing.duration)) : 1;
  return <AbsoluteFill style={{opacity: inK * outK, clipPath: transitionMask(inK, outK, spec.transitionIn, spec.transitionOut)}}>
    <Freeze frame={clampFrame(local, spec.to - spec.from + 1)}><FootageBody spec={spec} /></Freeze>
  </AbsoluteFill>;
};
export const FootageTrack: React.FC<{specs: FootageSpec[]}> = ({specs}) => (
  <AbsoluteFill>
    {specs.map((spec, i) => {
      const pre = transitionWindow(spec.from, durationOf(spec.transitionIn)).pre;
      const post = transitionWindow(spec.to + 1, durationOf(spec.transitionOut)).post;
      return <Sequence key={spec.id ?? `${spec.from}-${spec.to}-${spec.src}-${i}`} from={spec.from - pre - 1} durationInFrames={spec.to - spec.from + 1 + pre + post}>
        <FootageClip spec={spec} />
      </Sequence>;
    })}
  </AbsoluteFill>
);
