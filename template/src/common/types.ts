import React from 'react';
import type {StarVariant, StarFieldProps} from './StarField';
/** 镜头定义：from/to 为原片帧号（1 起，含端点），Main 用 <Sequence from={from-1} durationInFrames={to-from+1}> 挂载。 */
/** layer:'aboveBar' → Main 把该镜头挂在进度条之上、字幕之下（原片部分镜头的内容层压在半透明进度条之上，如 SC019.p1-b 自 y720 升起的元素；默认在进度条之下被条体提亮）。 */
export type TransitionKind = 'data-to-footage' | 'footage-to-data' | 'match-cut' | 'chapter';
export type TransitionDirection = 'left' | 'right' | 'up' | 'down';
/**
 * 转场配置只描述边界语义，具体帧由 TransitionTrack 根据 at/duration 计算。
 * duration 默认 18 帧；普通镜头建议 12–18，章节卡建议 24–30。
 */
export type TransitionSpec = {
  kind: TransitionKind;
  duration?: number;
  direction?: TransitionDirection;
  focusX?: number;
  focusY?: number;
  accent?: string;
};
export type ShotDef = {
  id: string;
  from: number;
  to: number;
  Comp: React.FC;
  layer?: 'aboveBar';
  transitionIn?: TransitionSpec;
  transitionOut?: TransitionSpec;
};
/** 背景常驻层覆写（按原片帧区间）：stars 选星点 variant 或细调参数（'none' 关掉），fog 关/开雾底。未覆写区间用全局默认（drift + 雾底开）。 */
export type BgSpec = {from: number; to: number; stars?: StarVariant | Partial<StarFieldProps>; fog?: boolean};
