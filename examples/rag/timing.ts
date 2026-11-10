/**
 * 样片镜头的基准时间轴与当前时间轴。
 *
 * 镜头源码中的事件帧仍以 BASE_RANGES 为参照；Sequence 使用 rangeFor() 的当前区间。
 * 当 TTS 或分镜重排后，只更新 CURRENT_RANGES（可由 sync_shot_timing.py 生成），
 * frameAt() 会按镜头区间比例把本地帧映射回基准时间轴。
 */
export type ShotRange = {from: number; to: number};

export const BASE_RANGES: Record<string, ShotRange> = {
  SC01: {from: 78, to: 167},
  SC02: {from: 168, to: 302},
  SC03: {from: 303, to: 445},
  SC04: {from: 446, to: 612},
  SC05: {from: 613, to: 743},
  SC06: {from: 744, to: 870},
  SC07: {from: 871, to: 1012},
  SC08: {from: 1013, to: 1129},
  SC09: {from: 1130, to: 1328},
  SC10: {from: 1329, to: 1480},
  SC11: {from: 1526, to: 1654},
  SC12: {from: 1655, to: 1890},
  SC13: {from: 1891, to: 2054},
  SC14: {from: 2055, to: 2308},
  SC15: {from: 2309, to: 2685},
  SC16: {from: 2686, to: 2860},
  SC17: {from: 2861, to: 3033},
  SC18: {from: 3034, to: 3298},
  SC19: {from: 3299, to: 3482},
  SC20: {from: 3483, to: 3662},
  SC21: {from: 3708, to: 3821},
  SC22: {from: 3822, to: 4056},
  SC23: {from: 4057, to: 4225},
  SC24: {from: 4226, to: 4414},
  SC25: {from: 4415, to: 4676},
  SC26: {from: 4677, to: 4926},
  SC27: {from: 4927, to: 5021},
  SC28: {from: 5018, to: 5313},
  SC29: {from: 5314, to: 5564},
  SC30: {from: 5565, to: 5696},
  SC31: {from: 5742, to: 5821},
  SC32: {from: 5822, to: 5946},
  SC33: {from: 5947, to: 6212},
  SC34: {from: 6213, to: 6406},
  SC35: {from: 6407, to: 6450},
  SC36: {from: 6451, to: 6709},
  SC37: {from: 6710, to: 6990},
  SC38: {from: 6991, to: 7167},
  SC39: {from: 7168, to: 7301},
  SC40: {from: 7302, to: 7503},
  SC41: {from: 7504, to: 7753},
  SC42: {from: 7754, to: 7869},
  SC43: {from: 7870, to: 8052},
  SC44: {from: 8053, to: 8148},
};

// 由分镜表同步的当前区间；初始值与基准时间轴相同。
// 由分镜表同步的当前区间；初始值与基准时间轴相同。
export const CURRENT_RANGES: Record<string, ShotRange> = {
  SC01: {from: 78, to: 167},
  SC02: {from: 168, to: 302},
  SC03: {from: 303, to: 445},
  SC04: {from: 446, to: 612},
  SC05: {from: 613, to: 743},
  SC06: {from: 744, to: 870},
  SC07: {from: 871, to: 1012},
  SC08: {from: 1013, to: 1129},
  SC09: {from: 1130, to: 1328},
  SC10: {from: 1329, to: 1480},
  SC11: {from: 1526, to: 1654},
  SC12: {from: 1655, to: 1890},
  SC13: {from: 1891, to: 2054},
  SC14: {from: 2055, to: 2308},
  SC15: {from: 2309, to: 2685},
  SC16: {from: 2686, to: 2860},
  SC17: {from: 2861, to: 3033},
  SC18: {from: 3034, to: 3298},
  SC19: {from: 3299, to: 3482},
  SC20: {from: 3483, to: 3662},
  SC21: {from: 3708, to: 3821},
  SC22: {from: 3822, to: 4056},
  SC23: {from: 4057, to: 4225},
  SC24: {from: 4226, to: 4414},
  SC25: {from: 4415, to: 4676},
  SC26: {from: 4677, to: 4926},
  SC27: {from: 4927, to: 5017},
  SC28: {from: 5018, to: 5313},
  SC29: {from: 5314, to: 5564},
  SC30: {from: 5565, to: 5696},
  SC31: {from: 5742, to: 5821},
  SC32: {from: 5822, to: 5946},
  SC33: {from: 5947, to: 6212},
  SC34: {from: 6213, to: 6406},
  SC35: {from: 6407, to: 6450},
  SC36: {from: 6451, to: 6709},
  SC37: {from: 6710, to: 6990},
  SC38: {from: 6991, to: 7167},
  SC39: {from: 7168, to: 7301},
  SC40: {from: 7302, to: 7503},
  SC41: {from: 7504, to: 7753},
  SC42: {from: 7754, to: 7869},
  SC43: {from: 7870, to: 8052},
  SC44: {from: 8053, to: 8148},
};

export const rangeFor = (id: string): ShotRange => CURRENT_RANGES[id] ?? BASE_RANGES[id];

/**
 * 将 Sequence 内的本地帧（0 起）映射到镜头源码使用的基准绝对帧。
 * 镜头内的节拍常量无需跟着 TTS 改动；只需要更新 CURRENT_RANGES。
 */
export const frameAt = (id: string, localFrame: number): number => {
  const base = BASE_RANGES[id];
  const current = rangeFor(id);
  if (!base || !current) return localFrame;
  const baseSpan = Math.max(1, base.to - base.from);
  const currentSpan = Math.max(1, current.to - current.from);
  return base.from + localFrame * (baseSpan / currentSpan);
};
