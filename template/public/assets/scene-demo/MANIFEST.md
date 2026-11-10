# 跨题材真实媒体验证素材

这套素材用于验证图片、真实可播放视频与代码动画的编排。来自 NASA 资料库，非 H3 输出，不宣称所有画面都是现场摄影。原始目录中的 credit 与说明为准。

| 文件 | 来源与用途 |
|---|---|
| `solar.jpg` / `solar-clip.mp4` | [NASA: April 2017 Solar Flare Trio](https://images.nasa.gov/details/GSFC_20170403_Trio_m12563_SolarFlares)，太阳活动资料影像 |
| `volcano.jpg` / `volcano-clip.mp4` | [NASA: How Do Active Volcanoes Change Clouds: Volcanoes Degassing](https://images.nasa.gov/details/GSFC_20141113_Volcanoes_m10183_Degassing)，火山脱气资料画面 |
| `solar-narration.wav` / `volcano-narration.wav` | 本机 Windows SAPI Microsoft Huihui，Rate=2，四段对齐到 0 / 2.4 / 5.6 / 8.8 秒；补齐为 12 秒，48kHz 双声道 |

原始资源 URL、哈希和视频裁切位置见 `sources.json`；源视频分别从第 12 秒与第 2 秒选取 6 秒，移除源音轨，编码为 H.264。实际采用视频为 480×270、30fps，图片为 800×450。这足以验证真实解码与混合编排，但低清源画质不能作为正式成片清晰度通过的证据。

太阳资料原为伪彩色，预览应用灰度与暖色调适配深海黑金；图中曲线无实测数据，已在画面明确标注“过程示意”。不以该调色解释科学波段或数值。火山影像做轻微低饱和处理。

使用信息：[NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)。本示例保留来源署名，不暗示 NASA 背书。视频和配音只服务这两个预览主题，不是公共引擎的题材限制。
