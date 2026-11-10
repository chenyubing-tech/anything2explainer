# 高清机制样例素材

这套资料用于验证图片、视频与代码机制动画的统一编排，H3 实际生成及采用数量均为 0。太阳画面为 SDO 观测资料；火山画面来自 NASA Goddard 的过程动画，不能称现场摄影。

| 输出文件 | 来源 | 实际规格 / 选段 |
|---|---|---|
| solar-clip.mp4 | NASA April 2017 Solar Flare Trio | 1920×1080、30fps，从原片 12 秒起取 6 秒 |
| solar-alt.mp4 | NASA April 17, 2016 Solar Flare | 1920×1080、30fps，从原片 10 秒起取 6 秒，已避开英文片头卡 |
| volcano-clip.mp4 | NASA Volcanoes Degassing | 1920×1080、30fps，从原片 2 秒起取 6 秒 |
| volcano-alt.mp4 | NASA Volcanoes Degassing Clouds | 1920×1080、30fps，从原片 2 秒起取 6 秒，与前段为不同动画素材 |
| solar.jpg / volcano.jpg | 各自 clip 的首帧 | 原生 1920×1080，没有放大补像素 |
| 两个 narration.wav | Windows SAPI Microsoft Huihui Desktop | 原速 Rate=0，48kHz 双声道，15 秒；句子实测时长见 qc/narration-evidence.json |

原始 URL、sourcePage、源文件和选段 SHA256、裁切起点与编码记录见 sources.json。源与输出均为原生高清，未升采样或插帧。原始下载保留在工程忽略目录 audio/nasa-sources/，不随构建发布。

太阳观测资料原为伪彩色，预览使用灰度和暖色处理以配合深海黑金；该调色不用于解释物理波段或数值。火山动画轻微降低饱和度。来源类型在画面标记。代码阶段均为定性机制示意，非按比例，不是实测曲线。

[事实记录](../../../qc/science-demo-facts.md)；[NASA 媒体使用说明](https://www.nasa.gov/nasa-brand-center/images-and-media/)。保留出处，不暗示 NASA 背书。不同片段用于说明不同视角或过程，不能把本轮 NASA 资料记为原创 H3 镜头。

重建：在 template/ 执行 python scripts/prepare_science_assets.py；配音执行 scripts/build_scene_narration.ps1，再运行 python scripts/mix_scene_narration.py。后者检查每句在对应字幕窗口内完整结束，不静默叠音，也不加速硬凑。
