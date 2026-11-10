import type {ShotDef, BgSpec} from '../../common';
import {rangeFor} from '../../timing';
import {SC01} from './SC01';
import {SC02} from './SC02';
import {SC03} from './SC03';
import {SC04} from './SC04';
import {SC05} from './SC05';
// 组 G1 镜头表 / 背景覆写。数组顺序即层序（后者在上）。帧区间见 rag/分镜表.md 与 rag/script/timeline.md。
export const SHOTS_G1: ShotDef[] = [
  {id: 'G1-SC01', ...rangeFor('SC01'), Comp: SC01},
  {id: 'G1-SC02', ...rangeFor('SC02'), Comp: SC02},
  {id: 'G1-SC03', ...rangeFor('SC03'), Comp: SC03},
  {id: 'G1-SC04', ...rangeFor('SC04'), Comp: SC04},
  {id: 'G1-SC05', ...rangeFor('SC05'), Comp: SC05},
];
export const BG_G1: BgSpec[] = [];
