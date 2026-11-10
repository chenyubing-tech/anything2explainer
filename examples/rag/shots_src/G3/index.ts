import type {ShotDef, BgSpec} from '../../common';
import {rangeFor} from '../../timing';
import {SC11} from './SC11';
import {SC12} from './SC12';
import {SC13} from './SC13';
import {SC14} from './SC14';
import {SC15} from './SC15';
// 组 G3 镜头表 / 背景覆写。数组顺序即层序（后者在上）。帧区间见 rag/分镜表.md 与 rag/script/timeline.md。
export const SHOTS_G3: ShotDef[] = [
  {id: 'SC11', ...rangeFor('SC11'), Comp: SC11},
  {id: 'SC12', ...rangeFor('SC12'), Comp: SC12},
  {id: 'SC13', ...rangeFor('SC13'), Comp: SC13},
  {id: 'SC14', ...rangeFor('SC14'), Comp: SC14},
  {id: 'SC15', ...rangeFor('SC15'), Comp: SC15},
];
export const BG_G3: BgSpec[] = [];
