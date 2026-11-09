import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Fonts, DotFieldBg, clamp01} from './common';
import {BACKGROUND, SURFACE, GOLD, BLUE_GREY, GREEN, GREY, GREY_LINE, WHITE, Box, CText, MonoText, Pill, TopCapsule, fadeIn} from './ui';

/** 无音频、无事实断言的主题校样；复用正式图元验证金底文字、曲线、表格与 HUD。 */
export const ThemePreview: React.FC = () => {
  const frame = useCurrentFrame();
  const N = frame + 1;
  const draw = clamp01((frame - 12) / 50);
  const rows = [
    {name: '研究报告 A', value: '0.78', state: '候选'},
    {name: '原始论文 B', value: '0.94', state: '✓ 命中'},
    {name: '技术文档 C', value: '0.82', state: '候选'},
  ];
  return (
    <AbsoluteFill style={{background: BACKGROUND}}>
      <Fonts />
      <DotFieldBg specs={[]} />
      <TopCapsule N={N} f0={1} text="深海黑金" w={250} tech="DEEP SEA / BLACK & GOLD" />
      <CText cx={640} cy={180} size={48} weight={700}>从数据，到有依据的回答</CText>
      {['提出问题', '检索证据', '形成回答'].map((label, i) => (
        <Pill key={label} x={280 + i * 250} y={232} w={220} h={48} fill={i === 1 ? GOLD : SURFACE} stroke={i === 1 ? GOLD : GREY_LINE} text={label} fontSize={26} />
      ))}
      <Box x={80} y={325} w={530} h={264} r={8} fill={SURFACE} stroke={GREY_LINE} sw={1}>
        <CText cx={265} cy={28} size={22} color={GREY} weight={500}>相关性变化 · 示意数据</CText>
        <svg width={530} height={264} aria-label="相关性变化示意曲线">
          {[90, 145, 200].map((y) => <line key={y} x1={48} x2={490} y1={y} y2={y} stroke={GREY_LINE} strokeWidth={1} />)}
          <line x1={48} x2={490} y1={218} y2={218} stroke={GREY} strokeWidth={1} />
          <line x1={48} x2={48} y1={65} y2={218} stroke={GREY} strokeWidth={1} />
          <defs><clipPath id="theme-curve"><rect x={45} y={60} width={450 * draw} height={160} /></clipPath></defs>
          <g clipPath="url(#theme-curve)">
            <path d="M50 202 C110 200 120 161 170 166 S242 129 280 135 S350 78 395 88 S455 65 488 68" fill="none" stroke={GOLD} strokeWidth={4} strokeLinecap="round" />
            <circle cx={395} cy={88} r={6} fill={BLUE_GREY} />
          </g>
        </svg>
        <CText cx={80} cy={242} size={18} color={GREY}>第 1 轮</CText>
        <CText cx={454} cy={242} size={18} color={GREY}>第 5 轮</CText>
      </Box>
      <Box x={670} y={325} w={530} h={264} r={8} fill={SURFACE} stroke={GREY_LINE} sw={1}>
        <CText cx={265} cy={28} size={22} color={GREY} weight={500}>候选证据 · 示意数据</CText>
        {rows.map((row, i) => {
          const active = i === 1;
          return <Box key={row.name} x={18} y={60 + i * 62} w={494} h={54} fill={SURFACE} stroke={active ? GOLD : GREY_LINE} sw={active ? 2 : 1} opacity={fadeIn(frame - (8 + i * 8), 12)}>
            <CText cx={110} cy={27} size={24} color={WHITE}>{row.name}</CText>
            <MonoText x={276} y={12} size={23} color={BLUE_GREY}>{row.value}</MonoText>
            <CText cx={429} cy={27} size={22} color={active ? GREEN : GREY}>{row.state}</CText>
          </Box>;
        })}
      </Box>
      <CText cx={640} cy={651} size={32} weight={500}>先找到证据，再组织答案。</CText>
      <div style={{position: 'absolute', left: 80, right: 80, top: 700, height: 3, background: GREY_LINE}}>
        <div style={{width: `${draw * 100}%`, height: 3, background: GOLD}} />
      </div>
    </AbsoluteFill>
  );
};
