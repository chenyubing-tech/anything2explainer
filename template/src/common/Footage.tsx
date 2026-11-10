import React from 'react';
import {AbsoluteFill, OffthreadVideo, Sequence, staticFile, useCurrentFrame} from 'remotion';
import {W, H, clamp, keyframes, DirBlur} from './lib';
import type {TransitionDirection, TransitionSpec} from './types';

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
const durationOf = (spec: TransitionSpec | undefined) => Math.max(0, spec?.duration ?? 0);
const directionOf = (spec: TransitionSpec | undefined, fallback: TransitionDirection) => spec?.direction ?? fallback;
const transitionMask = (inK: number, outK: number, incoming?: TransitionSpec, outgoing?: TransitionSpec): string | undefined => {
  const reveal = incoming ? inK : 1;
  const exit = outgoing ? outK : 1;
  const direction = directionOf(incoming ?? outgoing, incoming?.kind === 'data-to-footage' ? 'left' : 'right');
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
export const FootageClip: React.FC<{spec: FootageSpec}> = ({spec}) => {
  const inDuration = durationOf(spec.transitionIn);
  const outDuration = durationOf(spec.transitionOut);
  const N = spec.from - inDuration + useCurrentFrame();
  const scale = spec.zoomKf ? keyframes(N, spec.zoomKf) : 1;
  const pan = spec.panKf ? keyframes(N, spec.panKf) : 0;
  const panY = spec.panYKf ? keyframes(N, spec.panYKf) : 0;
  const blur = spec.blurKf ? keyframes(N, spec.blurKf) : 0;
  const focus = spec.focusKf ? keyframes(N, spec.focusKf) : 0;
  const baseOpacity = spec.opacityKf ? keyframes(N, spec.opacityKf) : 1;
  const inK = inDuration ? ease((N - (spec.from - inDuration)) / inDuration) : 1;
  const outK = outDuration ? 1 - ease((N - spec.to) / outDuration) : 1;
  const opacity = baseOpacity * inK * outK;
  const clipPath = transitionMask(inK, outK, spec.transitionIn, spec.transitionOut);
  return (
    <AbsoluteFill style={{overflow: 'hidden', opacity, background: '#101821', clipPath}}>
      <DirBlur bx={blur + focus} by={blur * 0.15 + focus}>
        <AbsoluteFill style={{transform: `translate(${pan}px, ${panY}px) scale(${scale})${spec.flipX ? ' scaleX(-1)' : ''}`, transformOrigin: `${spec.originX ?? 640}px ${spec.originY ?? 360}px`}}>
          <OffthreadVideo src={staticFile(spec.src)} trimBefore={spec.srcFrom} muted style={{width: W, height: H, objectFit: 'cover', filter: spec.filter ?? 'saturate(0.84) contrast(1.08) brightness(0.88)'}} />
        </AbsoluteFill>
      </DirBlur>
      {(spec.grade ?? 'dark') === 'dark' ? <DarkGrade /> : null}
    </AbsoluteFill>
  );
};
export const FootageTrack: React.FC<{specs: FootageSpec[]}> = ({specs}) => (
  <AbsoluteFill>
    {specs.map((spec, i) => {
      const pre = durationOf(spec.transitionIn);
      const post = durationOf(spec.transitionOut);
      return (
      <Sequence key={spec.id ?? `${spec.from}-${spec.to}-${spec.src}-${i}`} from={spec.from - pre - 1} durationInFrames={spec.to - spec.from + 1 + pre + post}>
        <FootageClip spec={spec} />
      </Sequence>
      );
    })}
  </AbsoluteFill>
);
