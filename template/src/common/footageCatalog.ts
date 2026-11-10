import type {FootageSpec} from './Footage';

export type FootageRange = {from: number; to: number};
export type ReusableFootageSource = Pick<FootageSpec, 'src' | 'srcFrom' | 'filter' | 'grade' | 'reuseKey'>;

/**
 * 为同一条 MiniMax-H3 素材创建多个镜头实例。
 * 每个实例可以独立裁切、推近、调焦和转场，避免为了复用素材复制整段配置。
 */
export const reuseFootage = (
  source: ReusableFootageSource,
  range: FootageRange,
  overrides: Omit<FootageSpec, 'src' | 'srcFrom' | 'from' | 'to' | 'reuseKey'> & {id?: string} = {},
): FootageSpec => ({
  ...source,
  ...overrides,
  from: range.from,
  to: range.to,
  reuseKey: source.reuseKey ?? source.src,
});

/** 统一的 H3 片段默认调色；实际 src 由项目素材清单注入。 */
export const h3Source = (src: string, reuseKey = src): ReusableFootageSource => ({
  src,
  srcFrom: 0,
  reuseKey,
  grade: 'dark',
  filter: 'saturate(0.82) contrast(1.08) brightness(0.88)',
});
