import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {clamp} from './lib';
import type {TransitionDirection, TransitionKind, TransitionSpec} from './types';
import {transitionWindow} from './sceneTimeline';

export type TimedTransition = TransitionSpec & {id: string; at: number};

const DEFAULT_DURATION = 18;
const GOLD = '#CFB47F';
const GOLD_LIGHT = '#E3CDA3';
const BACKGROUND = '#101821';

const ease = (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * clamp(t, 0, 1));
const directionOf = (direction: TransitionDirection | undefined, fallback: TransitionDirection): TransitionDirection => direction ?? fallback;

const scanPosition = (phase: number, direction: TransitionDirection) => {
  const t = ease(phase);
  if (direction === 'right') return 1280 * (1 - t);
  if (direction === 'up') return 720 * (1 - t);
  if (direction === 'down') return 720 * t;
  return 1280 * t;
};

const veilOpacity = (phase: number) => Math.sin(Math.PI * clamp(phase, 0, 1));

const DataToFootage: React.FC<{phase: number; focusX: number; focusY: number; direction: TransitionDirection; accent: string}> = ({phase, focusX, focusY, direction, accent}) => {
  const veil = veilOpacity(phase);
  const scan = scanPosition(phase, direction);
  const isVertical = direction === 'up' || direction === 'down';
  const line = isVertical
    ? {left: 0, top: scan - 2, width: 1280, height: 4 + 20 * veil}
    : {left: scan - 2, top: 0, width: 4 + 20 * veil, height: 720};
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', inset: 0, opacity: 0.16 * veil, backgroundImage: 'linear-gradient(rgba(227,205,163,.20) 1px, transparent 1px), linear-gradient(90deg, rgba(227,205,163,.15) 1px, transparent 1px)', backgroundSize: '80px 80px', transform: `scale(${(1 + 0.04 * veil).toFixed(4)})`}} />
      <div style={{position: 'absolute', left: focusX - 160 * veil, top: focusY - 160 * veil, width: 320 * veil, height: 320 * veil, borderRadius: '50%', background: `radial-gradient(circle, rgba(227,205,163,${(0.22 * veil).toFixed(3)}) 0%, rgba(207,180,127,${(0.08 * veil).toFixed(3)}) 34%, transparent 72%)`}} />
      <div style={{...line, background: `linear-gradient(${isVertical ? '180deg' : '90deg'}, transparent, ${GOLD_LIGHT}, ${accent}, transparent)`, boxShadow: `0 0 ${Math.round(10 + 28 * veil)}px ${Math.round(3 + 10 * veil)}px rgba(207,180,127,${(0.12 + 0.28 * veil).toFixed(3)})`, opacity: 0.18 + 0.46 * veil}} />
    </AbsoluteFill>
  );
};

const FootageToData: React.FC<{phase: number; focusX: number; focusY: number; direction: TransitionDirection; accent: string}> = ({phase, focusX, focusY, direction, accent}) => {
  const veil = veilOpacity(phase);
  const scan = scanPosition(phase, direction);
  const barCount = 7;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div style={{position: 'absolute', left: focusX - 220 * veil, top: focusY - 110 * veil, width: 440 * veil, height: 220 * veil, border: `${Math.max(1, 2 * veil)}px solid ${accent}`, boxShadow: `0 0 ${Math.round(16 + 30 * veil)}px rgba(207,180,127,${(0.12 + 0.35 * veil).toFixed(3)})`, opacity: 0.18 + 0.48 * veil}} />
      {Array.from({length: barCount}, (_, i) => {
        const y = 120 + i * 78;
        const offset = ((i % 2 ? -1 : 1) * (1 - phase) * 64);
        return <div key={i} style={{position: 'absolute', left: 80 + offset, top: y, width: 180 + (i % 3) * 90, height: 2, background: accent, opacity: 0.08 + 0.18 * veil}} />;
      })}
      <div style={{position: 'absolute', left: scan - 2, top: 0, width: 4 + 18 * veil, height: 720, background: `linear-gradient(180deg, transparent, ${GOLD_LIGHT}, transparent)`, boxShadow: `0 0 ${Math.round(8 + 24 * veil)}px ${Math.round(3 + 8 * veil)}px rgba(207,180,127,${(0.12 + 0.28 * veil).toFixed(3)})`, opacity: 0.22 + 0.48 * veil}} />
    </AbsoluteFill>
  );
};

const TransitionOverlay: React.FC<{spec: TimedTransition}> = ({spec}) => {
  const N = useCurrentFrame() + 1;
  const duration = spec.duration ?? DEFAULT_DURATION;
  const {start, end} = transitionWindow(spec.at, duration);
  if (duration <= 1 || N < start || N >= end) return null;
  const phase = (N - start) / (duration - 1);
  const focusX = spec.focusX ?? 640;
  const focusY = spec.focusY ?? 360;
  const direction = directionOf(spec.direction, spec.kind === 'footage-to-data' ? 'right' : 'left');
  const accent = spec.accent ?? GOLD;
  if (spec.kind === 'data-to-footage') return <DataToFootage phase={phase} focusX={focusX} focusY={focusY} direction={direction} accent={accent} />;
  if (spec.kind === 'footage-to-data') return <FootageToData phase={phase} focusX={focusX} focusY={focusY} direction={direction} accent={accent} />;
  const veil = veilOpacity(phase);
  return <AbsoluteFill style={{background: `rgba(16,24,33,${(0.1 + 0.78 * veil).toFixed(3)})`, border: `1px solid rgba(207,180,127,${(0.16 * veil).toFixed(3)})`, pointerEvents: 'none'}} />;
};

export const TransitionTrack: React.FC<{transitions: TimedTransition[]}> = ({transitions}) => (
  <AbsoluteFill>
    {transitions.map((spec) => <TransitionOverlay key={spec.id} spec={spec} />)}
  </AbsoluteFill>
);

export const transitionAt = (id: string, at: number, spec?: TransitionSpec): TimedTransition | null => spec ? ({...spec, id, at}) : null;
