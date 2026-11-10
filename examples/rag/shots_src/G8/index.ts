import type {ShotDef, BgSpec} from '../../common';
import {rangeFor} from '../../timing';
import {SC38} from './SC38';
import {SC39} from './SC39';
import {SC40} from './SC40';
import {SC41} from './SC41';
import {SC42} from './SC42';
import {SC43} from './SC43';
import {SC44} from './SC44';
// 组 G8 镜头表 / 背景覆写。数组顺序即层序（后者在上）。帧区间见 rag/分镜表.md 与 rag/script/timeline.md。
export const SHOTS_G8: ShotDef[] = [
  {id: 'SC38', ...rangeFor('SC38'), Comp: SC38},
  {id: 'SC39', ...rangeFor('SC39'), Comp: SC39},
  {id: 'SC40', ...rangeFor('SC40'), Comp: SC40},
  {id: 'SC41', ...rangeFor('SC41'), Comp: SC41},
  {id: 'SC42', ...rangeFor('SC42'), Comp: SC42},
  {id: 'SC43', ...rangeFor('SC43'), Comp: SC43},
  {id: 'SC44', ...rangeFor('SC44'), Comp: SC44},
];
export const BG_G8: BgSpec[] = [];
