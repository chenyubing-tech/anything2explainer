import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {TransitionTrack} from './common';
import type {TimedTransition} from './common';
import {BACKGROUND, GOLD, GOLD_LIGHT, SURFACE, WHITE, BLUE_GREY, Box, CText, MonoText} from './ui';

const TRANSITIONS: TimedTransition[] = [
  {id: 'preview-data-to-footage', at: 72, kind: 'data-to-footage', duration: 18, focusX: 640, focusY: 350, direction: 'left'},
  {id: 'preview-footage-to-data', at: 144, kind: 'footage-to-data', duration: 18, focusX: 640, focusY: 350, direction: 'right'},
];

export const TransitionPreview: React.FC = () => {
  const N = useCurrentFrame() + 1;
  const section = N < 72 ? 'code' : N < 144 ? 'footage' : 'code-again';
  return (
    <AbsoluteFill style={{background: BACKGROUND}}>
      {section === 'code' || section === 'code-again' ? (
        <>
          <Box x={210} y={170} w={860} h={360} r={18} fill={SURFACE} stroke={GOLD} sw={2} />
          <CText cx={640} cy={230} size={42} weight={900} color={WHITE}>知识库检索结果</CText>
          <MonoText x={290} y={300} size={26} color={BLUE_GREY}>query → embedding → nearest neighbors</MonoText>
          <div style={{position: 'absolute', left: 300, top: 374, width: 560, height: 10, background: `linear-gradient(90deg, ${GOLD}, transparent)`, opacity: 0.8}} />
          <div style={{position: 'absolute', left: 300, top: 414, width: 420, height: 10, background: `linear-gradient(90deg, ${GOLD_LIGHT}, transparent)`, opacity: 0.55}} />
        </>
      ) : (
        <>
          <AbsoluteFill style={{background: 'linear-gradient(135deg, #1a3140, #0d1b25 52%, #4d3d28)'}} />
          <div style={{position: 'absolute', left: 240, top: 160, width: 800, height: 400, borderRadius: 20, background: 'radial-gradient(circle at 62% 40%, rgba(227,205,163,.6), transparent 22%), linear-gradient(135deg, rgba(145,170,188,.36), rgba(16,24,33,.25))', boxShadow: '0 0 70px rgba(207,180,127,.14)'}} />
          <CText cx={640} cy={360} size={58} weight={900} color={WHITE}>MINMAX H3 VIDEO</CText>
        </>
      )}
      <CText cx={640} cy={650} size={24} weight={700} color={GOLD}>{section === 'footage' ? '生成视频片段' : '代码图表画面'}</CText>
      <TransitionTrack transitions={TRANSITIONS} />
    </AbsoluteFill>
  );
};
