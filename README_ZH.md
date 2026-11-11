# anything2explainer

[![Claude Code](https://img.shields.io/badge/Claude%20Code-skill-D97757?logo=anthropic&logoColor=white)](https://claude.com/claude-code)
[![Codex](https://img.shields.io/badge/Codex-skill-000000)](https://openai.com/codex)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-0B84F3)](https://remotion.dev)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-informational)](LICENSE)

[English](README.md) | **简体中文**

**给一个主题，产出一条带配音的科普讲解视频。** anything2explainer 是一个 [Claude Code](https://claude.com/claude-code) / [Codex](https://openai.com/codex) skill：输入任意主题，输出一条深海黑金 MG（motion graphics）风格的讲解视频，带 TTS 配音、字幕和章节进度条，中文或英文都行。图表、数字、表格等结构化画面默认由 [Remotion](https://remotion.dev)（React + TypeScript）代码绘制；调研阶段还会准备与主题相关的图片/视频素材，场景、过程演示与视觉隐喻主动使用实际可用的 MiniMax-H3 工具创作不同的新视频，真实资料或用户明确要求时优先保留原始媒体，外部素材采用前核对内容、来源/使用条件、画质和用途，未知项保持待核。

它不是一个 CLI。仓库里装的是让 AI 编程 agent 把片子做出来的整套方法：可编译的 Remotion 模板工程、图元与光效库、配音/分镜/渲染/量化质检工具、风格与动效规范、多 agent 分工协议，以及一条完整样片作为质量标尺。

**中文版**——《RAG 与知识库》v2，4′54″，44 句 / 1490 字，点阵波幕底（`bg: 'dots'`），配音走"自带 TTS"路径（火山引擎语音合成 2.0 + 强制对齐）：

https://github.com/user-attachments/assets/5c213990-cbba-439e-8371-fbb3aa348e05

**英文版**——*RAG & Knowledge Bases*，5′02″，44 句 / 785 词，kokoro-82m `am_liam` 自然语速：

https://github.com/user-attachments/assets/e2771c68-a28c-4459-ac5a-a5b685181eeb

两版共用一套分镜和 44 个镜头，英文版按英文配音逐镜头重排帧号。中文原版（4′35″，星点幕底，8 个构建 agent 并行 40 分钟 + 两轮 QC）的全套过程文件在 [`examples/rag/`](examples/rag/)（调研 → 解说词 → 分镜表 → 镜头源码 → QC 报告 → 交付说明），成片帧在 [`examples/rag/frames/`](examples/rag/frames/)。

## 它做什么

- **输入**：一个主题（"讲一下向量数据库"），或一篇想改成视频的文章/文档。时长和语言由你定。
- **输出**：1280×720 的 H.264 MP4，配音与字幕按词边界对齐，带章节卡、顶部 HUD 和底部章节进度条；同时交付全套过程文件（带出处的调研文档、解说词、分镜表、逐镜头源码、QC 报告）。
- **怎么做**：agent 先做带出处的调研，写解说词，生成配音和帧级时间轴，逐镜头写分镜，按环境与授权选择独立或分工构建 Remotion 场景；渲染后按所选模式进行技术检查和完整带声音的审美评审，修复、复验后交付。
- **耗时**：旧平面 MG 的参考工时约 1–3 小时；真实 3D、高清媒体与生成镜头按实际测渲和工具耗时安排。已有决定与授权直接沿用，只在关键输入缺失或范围改变时询问。

## 成片规格

| | |
|---|---|
| 画幅 / 帧率 | 1280×720 @ 30fps，H.264 |
| 时长 | 由你定（见下表），2–8 分钟都能做 |
| 语言 | 中文或英文（`src/config.ts` 的 `lang`）；排版、字幕长度预算、配音默认值随它切换 |
| 视觉 | 黑底，幕底二选一：点阵波（默认，移植自 video-talkcraft 的 dot-field-wave），或星点 + 雾底渐变（`src/config.ts` 的 `bg`）；灰白结构 + 沙金重点 + 蓝灰对照（无紫色，默认哑光）；超粗黑体大字 |
| 常驻层 | 44px 白字黑边字幕、底部章节进度条、顶部胶囊 HUD、可选流程轨 |
| 配音 | 中文 edge-tts `zh-CN-YunxiNeural`（云希，男声，原速不加速 ≈5.5 字/秒）/ 英文 kokoro-82m `am_liam`（Liam，男声）；也可用你自己的 TTS 或成品配音 |

以下仅是旧平面 ShotDef 的估算参考，不是新场景的镜头、人数或工时配额；短片与空间片按实际旁白、动作和测渲安排：

| 时长 | 中文字数 | 英文词数 | 句 / 镜头数 | 历史构建分工 | 产出耗时 | 磁盘 |
|---|---|---|---|---|---|---|
| 2–3 分钟 | 650–880 | 280–420 | 24–32 | 4–6 | ≈1 小时 | ≈2GB |
| 3–5 分钟（样片档） | 1100–1400 | 420–700 | 40–50 | 8 | ≈2 小时 | ≈2GB |
| 5–8 分钟 | 1650–2200 | 700–1150 | 60–80 | 10–14 | ≈2–3 小时 | ≈3GB |

章数、场景数和读取窗口按内容与实际配音确定。新 SceneSpec 不采用旧镜头固定停留或每镜头一次运镜的预算；制作流程与模式选择统一见 [制作流程](reference/production-workflow.md)，旁白格式和旧模式参考见 [解说与分镜](reference/narration-storyboard.md)。

## 安装

```bash
git clone https://github.com/chenyubing-tech/anything2explainer.git
ln -s "$PWD/anything2explainer" ~/.claude/skills/anything2explainer   # Claude Code
ln -s "$PWD/anything2explainer" ~/.codex/skills/anything2explainer    # Codex
```

依赖：

```bash
# Node ≥18（模板 npm install 会装 remotion 4.0.507 / react 19）
brew install ffmpeg          # 抽帧 / 转码，必需

python3 -m venv ~/.venvs/a2e && source ~/.venvs/a2e/bin/activate
pip install 'edge-tts==7.2.8' numpy pillow scipy   # 建议固定 edge-tts 版本：它跟着微软端点变，升级常有破坏性（7.2.0 起词边界要显式请求，脚本已处理）

# 只做英文片时再装（kokoro-82m 本地推理）
pip install kokoro soundfile && brew install espeak-ng
```

`scipy` 只给旧模式质检脚本 `frame_metrics.py` 用。下方 shell 命令需要 zsh、rsync 等工具；Windows 已验证的模板检查与样例渲染使用原生 Node/Remotion 命令，见 [平台与命令](reference/production-workflow.md#4-平台与命令)。Unix 脚本的完整成功流水线未在本次 Windows 复查中验证。

### Linux / 树莓派（ARM）

已在树莓派 5（ARM64、Debian trixie、Python 3.13）上跑通。与 macOS 有三处不同：

```bash
sudo apt install zsh espeak-ng                 # 脚本是 #!/bin/zsh；espeak-ng 供 kokoro/piper 的 G2P

# Remotion 没有 linux-arm64 的无头浏览器 → 指向系统 Chromium：
sudo apt install chromium                       # 或 chromium-browser
export REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium   # 由 template/remotion.config.ts 读取（macOS 上无副作用）
```

**Linux/ARM 上的配音。** 默认英文引擎 `kokoro` 在 ARM/Python 3.13 上很难装：它固定了旧版 numpy（无 aarch64/py3.13 轮子，只能源码编译，会失败），且依赖 spaCy → `blis`（无 aarch64 轮子、编译不过）。补了两个能干净安装的本地引擎，用 `TTS_ENGINE` 指定，二者都走既有的“逐字幕块合成”路径：

```bash
# kokoro_onnx —— 音色自然，onnxruntime（不依赖 torch/spaCy）。模型与声音库从
#   github.com/thewh1teagle/kokoro-onnx 的 releases 下（kokoro-v1.0.onnx、voices-v1.0.bin）
pip install kokoro-onnx
TTS_ENGINE=kokoro_onnx KOKORO_ONNX_MODEL=…/kokoro-v1.0.onnx KOKORO_ONNX_VOICES=…/voices-v1.0.bin \
  KOKORO_ONNX_VOICE=am_michael python3 scripts/tts_build.py

# piper —— 最快的本地引擎，音色偏机械，作树莓派原生兜底。语音 .onnx 从 github.com/rhasspy/piper 下
pip install piper-tts
TTS_ENGINE=piper PIPER_MODEL=…/en_US-ryan-medium.onnx python3 scripts/tts_build.py
```

`edge` 引擎（自然、免费、有词级边界）在 Linux 上也能用，且不需要本地模型——它是调微软云端接口：`TTS_ENGINE=edge VOICE=en-US-AndrewNeural python3 scripts/tts_build.py`。

## 用法

在 Claude Code 或 Codex 里直接说要做什么，skill 会被触发：

> 讲一下向量数据库，做成一条讲解视频

> Make me an explainer video about vector databases.

新片按 [制作流程](reference/production-workflow.md) 从调研、文案和声音推进到分镜、素材、构建与验收；复用已有决定与授权。局部修改只处理本次范围。是否分工取决于授权和实际工具，不固定 agent 数量。

新混合/空间片优先使用 SceneSpec，入口见 [场景编排](reference/scene-composition.md) 与 [空间动效](reference/spatial-motion-direction.md)。H3 需实际可用的生成工具；无工具时完成计划并明确待生成，不将提示词算成生成成果。

旧 ShotDef 模式可手动跑模板（新 SceneSpec 合成用制作流程中的实际合成名和命令）：

```bash
template/scripts/new_project.sh ~/work/my-video myslug
cd ~/work/my-video
# 1. research/调研.md          2. script/narration.txt → python3 scripts/tts_build.py
# 3. script/storyboard_src.md → python3 scripts/render_storyboard.py     4. 改 src/config.ts
# 5. src/shots/G1..Gn          6. scripts/preview.sh 30（前 30 秒样片）
# 7. VER=v1 scripts/render.sh + python3 scripts/frame_metrics.py         8. QC → 修 → v2/v3
```

## 四项制作输入与评审成果

这些是新片需要的信息与可评审成果；已有上下文或授权时直接沿用，不反复暂停。局部修改不重开整片流程（见 [制作流程](reference/production-workflow.md)）：

1. **时长与语言**：写文案之前。时长决定内容规模；是否分工及并发量按环境和授权确定；语言决定 `src/config.ts` 的 `lang`，进而影响排版、字幕预算和默认音色。
2. **解说词定稿**：配音之前。文案改变后重新对齐声音、字幕与场景；新场景复用局部时钟，不假定所有镜头都要重写绝对帧号。
3. **配音**：跑 TTS 前沿用已有声音偏好；确实缺失关键输入时再询问，没有额外偏好时用默认（中文 edge-tts 云希、英文 kokoro-82m Liam）。也可以直接给成品配音，自己按逐句时间轴填 `timeline.ts`。
4. **前 30 秒样片**：优先验证关键动作与承接，长片可先看前 30 秒，短片按实际动作长度取段。已认可的样片继续沿用，局部修改不重开确认。

## 和其他工具的区别

| 工具类型 | 产出什么 | anything2explainer 的不同 |
|---|---|---|
| 视频生成模型（Sora、Veo、可灵、即梦） | 按提示词生成的画面 | 代码保证精确数据与排版，并组合真实资料、代码 3D 与实际可用的生成素材；代码可按帧修改，生成内容按需重选或重新生成 |
| 数字人 / 口播工具（HeyGen、Synthesia） | 一个数字人读稿 | 没有主播；用 MG 图形把机制画出来，解说词驱动画面 |
| 直接手写 Remotion / Motion Canvas | 一块可编程的视频画布 | 在画布之上给出整套方法：调研 → 解说词 → 分镜 → 构建 → 技术与审美评审，附风格规范、动效词表和一条可对标的样片 |
| Manim | Python 数学动画 | agent 驱动的端到端流水线，字幕按 TTS 对齐，带章节与 QC；技术栈是 React / TypeScript 而不是 Python |

## 常见问题

**支持哪些 AI 编程 agent？**
为 Claude Code 和 Codex 编写，也只在这两个上跑过。skill 本身就是 Markdown 加一个 Remotion 工程，任何能读 `SKILL.md` 式 skill 目录、能执行 shell 命令的 agent 理论上都能照着做。

**需要 GPU 吗？**
平面 MG 可用无头 Chromium 在 CPU 上渲染。真实 3D 需要可工作的 WebGL 渲染环境，软件渲染或 GPU 的可用性与速度须在本机测渲。中文默认 edge-tts 使用云端接口；英文默认 kokoro-82m 可在 CPU 本地运行。

**能用自己的声音或别的 TTS 吗？**
可以。把成品音频放到 `public/assets/<slug>/audio.wav`，按 `tts_build.py` 文件头的格式手填 `src/common/timeline.ts` 和 `subs.ts`，后续流程不变。

**能换视觉风格吗？**
默认深海黑金，主题色以 `src/theme.ts` 为准。`config.bg` 切换旧平面幕底；新场景与 3D 可按主题建立环境、几何和材质，同时统一颜色、字阶及可读性。视觉规则见 [风格指南](reference/style-guide.md)。

**渲染结果可复现吗？**
动画与随机按帧和固定种子驱动，保证相同时间输入得到相同参数。实际像素还依赖素材、字体、浏览器和 WebGL 环境；跨机器不能承诺逐像素一致。

**能商用吗？**
工具包本身是 PolyForm Noncommercial 许可：非商业使用免费，商业使用需事先获得作者授权。用它做出来的视频归你自己。见[许可](#许可)。

**能做竖屏（9:16）吗？**
目前不能。模板和全部安全区规则都按 1280×720 横屏设计。

**支持哪些语言？**
中文和英文。各有自己的语速模型、字幕预算与默认音色。两版成片都嵌在本页顶部；`examples/rag/` 里的过程文件是中文版的。

## 仓库结构

```
SKILL.md                  任务范围、制作模式、当前规则与按需参考入口
reference/                写给主会话与 agent 的规范
  style-guide.md            安全区、调色板、字体、图元目录、版式规律
  motion-vocabulary.md      入场/强调/光效/离场/运镜的公式与帧数
  composition-and-light.md  主体尺寸三档、光跟主角、高光时刻编排、量化判据
  narration-storyboard.md   解说词写法、配音参数、分镜令牌、镜头设计模式表
  research-brief.md         研究员 prompt 与事实规则
  agent-build-rules.md      构建 agent 协议
  agent-qc-rules.md         QC agent 协议
  prompts.md                研究/构建/QC/修复/复验/终检六种 prompt 模板
  lessons.md                三部片子踩过的坑与根因
template/                 可编译的 Remotion 4 项目（用 scripts/new_project.sh 复制）
  src/common/               雾底、星点、点阵波、glitch、缓动、字幕、进度条、实拍层
  src/ui.tsx  src/fx.tsx    图元与调色板 / 光效·纵深·运镜图元
  src/overlay/              片头、章节卡、HUD、流程轨、片尾
  scripts/                  配音、分镜、still、测渲、前 N 秒样片、整片渲染、量化质检
  public/fonts/             四款字体 + OFL 许可
examples/rag/             样片全套过程文件与成片帧
examples/contrast/        6 组正例/反例帧对照（构图与光的标尺）
```

## 致谢

视觉风格的灵感与标尺来自抖音创作者 **@图灵宇宙** 的科普视频——黑底、白线条配紫色重点、超粗黑体大字这套语言是从他的片子里学来的；当前模板已改为深海黑金。本项目所有画面均由代码原创绘制，不使用其任何帧、素材或工程文件；如有不妥请开 issue 告知。

默认配色为**深海黑金**：背景 `#101821`、主强调 `#CFB47F`、辅助 `#91AABC`、正文 `#ECEEF0`、次要灰 `#97A4AE`、成功色 `#9DB8A7`。模板已同步；RAG 样片保留历史配色。

## 原创性

- **结构化画面代码绘制，关键素材可引用**：图表、数字、表格和流程默认用代码绘制；关键图片或视频可以使用调研阶段搜集的素材，可根据需要显示引用标题。外部素材在清单中记录来源、使用条件、用途及关联事实或镜头，采用前完成核对，文件哈希可用于确认版本；真实资料优先使用原始媒体；场景、空间关系、过程和视觉隐喻主动用 MiniMax-H3 创作新素材，生成素材标记为 AI 生成。分镜与提示词设计见 [H3 导演指南](reference/generated-video-direction.md)。
- **事实有出处**：画面上出现的每个数字、年份、机构、英文术语都必须能在该片的调研文档里找到来源 URL，没核实的不上画面也不进配音。

## 许可

工具包本身：[PolyForm Noncommercial 1.0.0](LICENSE)——非商业使用免费，商业使用需事先获得作者授权。**用它做出来的视频归你自己**。
模板内四款字体（Noto Sans SC / Orbitron / Exo 2 / Audiowide）按 SIL OFL 1.1 单独授权，版权与许可全文见 [`template/public/fonts/LICENSE.md`](template/public/fonts/LICENSE.md)。
Remotion 自身对公司用户另有授权要求，见 [remotion.dev/license](https://remotion.dev/license)。

## 已知限制

- 中英文都支持（`lang: 'zh' | 'en'`），各有自己的语速、字幕块预算（每块 16 字 / 48 字符）与默认音色。两版成片都嵌在上方；`examples/rag/` 的过程文件是中文版的。默认深海黑金；`bg` 的两种幕底用于旧平面模式，新场景环境按主题设计。
- 不适用：复刻某条现有视频、真人口播、以实拍为主的片子。
- 解说词改动后须重排受影响的声音、字幕与场景；旧 ShotDef 同步其绝对时间区间，新 SceneSpec 按新的局部节拍和边界校验。
- 并行构建对机器有要求：多个 agent 同时跑 Remotion bundle，建议预留 ≥5GB 磁盘；并发按当前宿主可用能力安排，不依赖固定 pane 数。

## Star History

<a href="https://www.star-history.com/?type=date&repos=Vincentwei1021%2Fanything2explainer">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=Vincentwei1021/anything2explainer&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=Vincentwei1021/anything2explainer&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=Vincentwei1021/anything2explainer&type=date&legend=top-left" />
 </picture>
</a>

## 设计审美与成片评审

集成 [taste-skill](https://github.com/Leonxlnx/taste-skill) 的设计视角，将主题优先、构图与边线、统一视觉世界、克制而有目的的动效及证据驱动的完成检查，适配为 [八维成片审美规则](reference/taste-video-review.md)。分镜前写方向卡，实际成片完成后带声音通看、逐镜头评审并复验问题，使用 [报告模板](reference/taste-review-report-template.md)。网页检查脚本不能直接评审视频，本集成没有安装其 Stop hook；也不改变已确认的深海黑金。来源版本与 MIT 许可见 [第三方说明](THIRD_PARTY_NOTICES.md)。

## 通用混合场景预览

图片、视频、代码图表在同一场景编排，由统一边界同步切换，普通转场总长 18 帧。接入、源时间和检查命令见 [场景编排指南](reference/scene-composition.md)。在模板 Studio 选择 `MixedSolar`（太阳物理）或 `MixedVolcano`（地球科学），可以查看带中文配音的 15 秒高清资料预览。素材来自 NASA，并非 H3 输出；公共组件不绑定题材。

新增 `SpatialVolcano`：在现有火山预览中接入代码生成的三维剖面与通道穿行，相机跟随气体进入内部，再从出口拉回整体。Studio 选择该合成，或运行 `npx remotion render src/index.ts SpatialVolcano`。使用 Three.js / `@remotion/three`，模型为解释性抽象，不是物理仿真或 H3 输出；实际验证范围见 [检查记录](template/qc/spatial-volcano-validation.md)。
