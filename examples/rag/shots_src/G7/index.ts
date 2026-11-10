import type {ShotDef, BgSpec} from '../../common';
import {rangeFor} from '../../timing';
import {SC31} from './SC31';
import {SC32} from './SC32';
import {SC33} from './SC33';
import {SC34} from './SC34';
import {SC35} from './SC35';
import {SC36} from './SC36';
import {SC37} from './SC37';
// 组 G7 镜头表 / 背景覆写。数组顺序即层序（后者在上）。帧区间见 rag/分镜表.md 与 rag/script/timeline.md。
export const SHOTS_G7: ShotDef[] = [
  {id: 'SC31', ...rangeFor('SC31'), Comp: SC31},
  {id: 'SC32', ...rangeFor('SC32'), Comp: SC32},
  {id: 'SC33', ...rangeFor('SC33'), Comp: SC33},
  {id: 'SC34', ...rangeFor('SC34'), Comp: SC34},
  {id: 'SC35', ...rangeFor('SC35'), Comp: SC35},
  {id: 'SC36', ...rangeFor('SC36'), Comp: SC36},
  {id: 'SC37', ...rangeFor('SC37'), Comp: SC37},
];
export const BG_G7: BgSpec[] = [];
