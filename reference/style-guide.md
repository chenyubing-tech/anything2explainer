# 风格指南（视觉体系）

默认主题为**深海黑金**：藏蓝黑背景、灰白结构与正文、沙金当前重点、蓝灰对照数据。金色是局部强调，避免铺满画面；默认哑光，普通标题/HUD/表格不加霓虹光晕。字体、字幕和布局沿用模板。`examples/rag/` 的镜头源码统一使用主题 token，构图、节拍和动画可直接作为样片参考。

## 1. 画布与安全区（1280×720@30fps）
| 区域 | 像素 | 说明 |
|---|---|---|
| 黑底 | 全幅 #101821 | Main 唯一的不透明黑底；镜头组件**不要**再画不透明黑底 |
| 雾底 Fog | y415→687 线性 #101821→#14202B，687→720 恒 #14202B | 全片常驻（`common/Fog.tsx`） |
| 星点 StarField | 出生区 0–687，80 颗 2–4px，亮度 35–255 偏暗，漂移 0.4–3.2px/帧，寿命 60–200 帧，逐帧 ±30% 闪烁 | 确定性纯函数（`common/StarField.tsx`）；`BG_Gn` 可按帧区间关掉 `{fog:false, stars:'none'}` |
| 点阵波 DotFieldBg（**默认**，替代 雾底 + 星点） | 设计坐标 960×540 等比放大：点距 48px、半径 2–2.7px、底色 #101821、点色 #91AABC，透明度 (0.08 + 0.22k²)×径向边缘衰减，斜向波前约 9.3 s 扫过一遍，叠 .06 静态噪点抗色带 | video-talkcraft `motion-systems/backdrop.tsx` 的 dot-field-wave 移植（`common/DotFieldBg.tsx`）；`config.bg = 'dots'` 启用，与星点雾底互斥；`BG_Gn` 的 `stars:'none'` 同样关掉它；屏幕空间静态纹理，不跟运镜；`frame_metrics.py` 按同一网格把点抠掉再统计 |
| 顶部 HUD 胶囊 | (533,28,216,51) r25.5，沙金 #CFB47F 填充 + 灰白 2px 边，33px 700 藏蓝黑字；英文副标 Exo 2 30px 金在 y≈94 | 覆盖层绘制；换词 8 帧淡入 |
| 流程轨（可选） | 胶囊 top 118 高 44 宽 150，中心 x 240/440/640/840/1040，间小箭头 | 当前步金底深字、已过 #253442 底灰白字、未到深底灰边灰字 |
| **内容主区** | 无轨的章 y110–620；有轨的章 y175–620；x60–1220 | 关键信息只放这里 |
| 字幕带 | CSS top 637，墨迹 y644–684，44px Noto 700 白 + 4px 黑描边（16+8+4 向 text-shadow 环）居中 | **不放任何内容**；入场轨迹不得穿过 |
| 进度条 | y687–720 半透明：已播 rgba(207,180,127,.38)、未播 rgba(145,170,188,.10)；n−1 根白分隔线；章名 Noto 900 24px skewX(−10°) scaleY(.9)，当前章 α1 其余 .55 | 内容穿过会被提亮，只允许全幅背景/大图形穿过 |
| z 序 | 黑底 < 幕底（Fog + 星点，或 DotFieldBg）< 实拍 < 覆盖层 < 镜头 < 片尾压黑 < 进度条 < aboveBar 镜头 < 字幕 | |

## 2. 深海黑金调色板（`src/theme.ts`，`src/ui.tsx` 转出）
| 名 | 值 | 语义 |
|---|---|---|
| BACKGROUND | #101821 | 全片藏蓝黑背景 |
| SURFACE | #14202B | 图表、文档和卡片填充 |
| GOLD / GOLD_TECH | #CFB47F | 唯一主强调色；当前重点、曲线、技术词、HUD |
| GOLD_LIGHT / GOLD_PALE | #E3CDA3 / #F0E2C8 | 小范围高光与浅金细节 |
| GOLD_DEEP | #7D663F | 暗部投影；不可用作小字号正文 |
| BLUE_GREY / CORAL | #91AABC | 对照、指标数字、查询点；无需高饱和橙色 |
| WHITE | #ECEEF0 | 结构、正文、箭头 |
| GREY / GREY_MID / GREY_LINE / GREY_LIGHT | #97A4AE / #788894 / #354552 / #C2CCD3 | 次要正文 / 弱化元素 / 网格 / 文档线 |
| GREEN / RED_DEEP | #9DB8A7 / #D9827D | 成功 / 错误，配文字或勾叉，不作装饰 |
| GLOW_GOLD / GLOW_GOLD_S | 沙金 8–12% 透明度的局部微光 | 可选；不要求每个主角发光 |
| GLOW_BLUE_GREY / GLOW_RED | 低强度蓝灰 / 红色微光 | 仅在需要强调状态时使用 |

金色实底必须用深色字 `BACKGROUND`，不可金底白字；`Pill`/`TagBlock` 会自动选择文字颜色。深色卡片用灰白字，激活时加金边或低透明度金底。图表用金色主线、蓝灰对照、暗灰网格。常驻英文副标仍用 `GREY`，不与主标题争焦点。

为兼容旧镜头，`PURPLE*` / `GLOW_PURPLE*` / `glowPurple*` 名称仍可导入，但实际值已映射为沙金；`ORANGE` / `GLOW_ORANGE` 映射为蓝灰。新代码使用 GOLD / BLUE_GREY。禁止从旧样片复制写死的紫色色值、紫色渐变或品红残影；RGB 残影若显式启用也只用沙金和蓝灰。

校样：模板提供无音频 `ThemePreview` 合成，复用正式图元检查 HUD、金底深字、曲线与表格。运行 `npx remotion still src/index.ts ThemePreview stills/deep-sea-black-gold.png --frame=100`，或在 Studio 中选择 ThemePreview。

## 2.1 镜头时间轴同步

镜头源码内部的节拍继续以 `BASE_RANGES` 为基准，Sequence 区间从 `CURRENT_RANGES` 读取。旁白或 TTS 重排后，先生成带实际帧号的 `examples/rag/分镜表.md`，再同步当前区间：

```powershell
python template/scripts/sync_shot_timing.py `
  --storyboard examples/rag/分镜表.md `
  --timing template/src/timing.ts
python template/scripts/sync_shot_timing.py `
  --storyboard examples/rag/分镜表.md `
  --timing examples/rag/timing.ts
```

这样只需更新分镜表和 `CURRENT_RANGES`，不必手动改动 44 个镜头里的绝对节拍帧。

## 2.2 图片、视频与代码画面统一编排

新片混合场景使用 `SceneSpec`、`SceneTrack` 和 `BoundarySpec`，实际接口与可运行示例见 [scene-composition.md](scene-composition.md)。场景内显式控制图片、视频、图表和标注的层序、视口与运动；字幕和导航独立。

边界的 `durationFrames: 18` 表示总共 18 帧（30fps 下 0.6 秒），前后各 9 帧；图片、视频和代码使用同一个进度。旧 `transitionIn/transitionOut` 的 `duration` 也已改为总长度，但旧轨道不自动控制代码镜头，完整同步需迁移到新场景。

生成前按 [H3 导演指南](generated-video-direction.md) 设计不同的新素材与共同物体/构图/运动方向。`reuseFootage()` 只作可选兼容工具。`TransitionPreview` 是旧转场装饰示意；真实媒体链路看 `MixedSolar` 和 `MixedVolcano`，它们使用 NASA 资料而非 H3 输出。

## 2.3 节奏二轮调整

30fps 下，普通镜头目标为 105–165 帧（3.5–5.5 秒）；超过 180 帧时，画面至少要有两个持续到下一节拍的语义动作。动作应表现解说词里的动词，例如数据流入卡片、曲线扫描、指标逐项聚焦、节点跳转或结构重排。单纯增加漂浮、呼吸和装饰粒子不算节奏修复。

本轮优先修复长镜头内部的低变化区，保持旁白和镜头区间不变；需要压缩总时长时，先在 `tts_build.py` 重排语音与分镜，再用 `sync_shot_timing.py` 同步区间，避免只缩短 Sequence 造成字幕和旁白错位。

## 3. 字体（`public/fonts`，全部 OFL；`common/lib.tsx` 的 `Fonts` 在 Main 挂一次）
| 角色 | 族 | 字号/字重/变形 |
|---|---|---|
| 大标题（片名、章节卡、镜头重点词） | Noto Sans SC | 56–96px / 900 / scaleX .85，可加 1px 黑描边 paintOrder stroke |
| HUD 胶囊字 | Noto Sans SC | 33px / 700 / letterSpacing 1 |
| 胶囊/标签 | Noto Sans SC | 24–30px / 600–800 / textDy −2（CJK 墨迹偏低 3–7px 要预扣） |
| 图内说明 | Noto Sans SC | 22–26px / 500–600 / 灰或白；**最小 22px** |
| 字幕 | Noto Sans SC | 44px / 700 / 无压缩 |
| 英文技术词 | Exo 2 Italic | 26–38px / 600–700 / scaleX .8 / 金；TechText 组件 |
| 宽体展示字（片名缩写、大写词） | Audiowide | 96–150px / 字距 6 / 灰白 + 可选深金投影 3px |
| 数字/章序号/计数 | Orbitron | 24–110px / 700 / tabular-nums |
| 公式 | Times New Roman Italic | 34–36px 白 + drop-shadow 3px |
| 代码/向量数字 | 等宽 FONT_MONO | 22–24px |

### 3.1 英文片（`config.ts` 的 `lang: 'en'`）
Noto Sans SC 自带完整拉丁字形（实测 wght 100–900 全覆盖），所以**不需要再加字体**：正文、标签、字幕仍用 `FONT_HEAVY`，展示大字用 Audiowide / Orbitron。三条差异由 `lang` 自动生效，别在镜头里手写死值：
- **不压窄**：`SQUEEZE`（`common/lib.tsx`）中文 .85 / 英文 1。拉丁字母 scaleX .85 会明显变形。片头、章节卡已经用它。
- **基线不预扣**：`CText` 的 `dy` 默认取 `TEXT_DY`（中文 −2 / 英文 0）——CJK 行盒的墨迹偏低，拉丁不偏。
- **宽度兜底**：字幕、进度条章名、章节卡标题、片头大字都过 `fitSize()`（`common/textfit.ts`，按实测 em 宽估算，纯函数所以渲染确定）。它只是兜底：超预算说明文案该切，见 `narration-storyboard.md` §5。
- 英文片里 `TechText`（Exo 2 金色斜体）只用于**术语强调**，不要整句用——整段斜体在英文里读起来像引文。
- 一行英文大写词比中文占宽得多：Audiowide 大写平均 .79em、Orbitron .82em、Noto 大写 .67em / 小写 .57em（fontTools 实测）。估宽用 `textW(s, size, EM_WIDE|EM_ORB|EM_TECH, letterSpacing)`；带 `letterSpacing` 的大字（片头、章节卡）要把它传进去——它是固定 px、不随字号缩，`fitSize()` 同样有这个参数。

## 4. 图元目录（`src/ui.tsx`，镜头 `import {…} from '../../ui'`）
| 组件 | 用途 | 关键 props |
|---|---|---|
| `CText` | 墨迹中心定位单行文字 | cx cy size weight color scaleX dy italic shadow |
| `TechText` | Exo 2 金色斜体英文 | cx cy text fontSize scaleX glow |
| `MonoText` | 等宽多行 | x y size |
| `Box` | 黑底白边矩形（fill 可渐变；dashed；glow） | x y w h r sw |
| `Pill` | 全圆角胶囊 + 居中文字 | Box props + text fontSize weight textDy |
| `TagBlock` | 大标签色块（金/蓝灰/深红）+ 900 字 scaleX .8 + 同色外发光 | x y w h color text |
| `Svg` | 全幅 1280×720 SVG 容器（默认 BLOOM） | children |
| `LineArrow` | 任意方向箭头，p 自根部长出 | x0 y0 x1 y1 p rodW headL headW dashed |
| `ArrowH` | 水平箭头 div 版（左端锚 scaleX） | x y w p dir |
| `Check` / `Cross` | 绿勾 / 红叉 draw-on（p≤0 不渲染） | cx cy size p |
| `DocIcon` | 折角文档 + 文本线条 + 标签 | x y w h lines label accent |
| `DBIcon` | 数据库圆柱 | cx cy w h label accent |
| `ChunkCard` | 文本块卡（active 金边柔光） | x y w h lines active title |
| `LLMIcon` | 大模型：圆角方块 + 三层神经元点阵 | cx cy size label glow |
| `Trap` | 倒梯形漏斗层，灰↔金 k 渐变 | cx y wTop wBot h k text |
| `TopCapsule` | 顶部 HUD 胶囊（覆盖层用） | N f0 text w tech glitch |
| `Counter` | tabular 数字 | cx cy value size |
| `SoftIn` | **默认入场**：8 帧淡入 + 10px 上浮（签名同 GlitchIn） | N f0 children len dy |
| `GlitchIn`（common） | 12 帧透明度闪烁入场，rgbSplit/slices 变体 | N f0 seq rgbSplit slices |
| 小工具 | `fadeIn/fadeOut/slideUp/scaleIn/exitAccel/exitFade/stagger/abs` | |
按主题补图元时放进 `ui.tsx`（如样片补了 DocIcon/DBIcon/ChunkCard/LLMIcon），组内特有的放组目录 `gNui.tsx`。参考实现：`examples/rag/shots_src/*/`。

光效 / 高光时刻 / 纵深 / 运镜图元在 `src/fx.tsx`（`import {…} from '../../fx'`）：
| 组件 | 用途 |
|---|---|
| `LightBar` / `LightSweep` | 金色光条横扫（登场型高光时刻开场三轮；**全片 ≤2 处**，只给扫光白名单里的镜头） |
| `TechSub`（`ui.tsx`） | 中英配对的副标：主体下面那行另一种语言，灰色小字（HUD 22px / 章节卡 26px），**不用金色、不与主体同大小**——金色只给当前重点，等大同色会读成两个主体 |
| `StageLine` | 中央舞台光线：展宽 → 呼吸 → 节拍帧白闪消失 |
| `GhostText` / `ghostOpacity` | 主角大字的白描边轮廓 10% 预示 |
| `HaloRing` | 主体脚下金色光环，可分 back / front 夹住主体 |
| `HeroGlow` | 任意矩形主角的局部金色微光 + 30 帧呼吸 |
| `BigNumber` / `countTo` | Orbitron 大数字 + 深金投影 + 计数 |
| `Sparkle` / `GradBall` | 四角小星 / 顶亮底黑小球 |
| `TiltPlane` | 倾斜平面（纵深层） |
| `CameraRig` / `camAt` | 定点推近 / 拉远 / 平移 / 整页滚动 / 承接位移 |
| `SET_PIECE` / `setPiece` | 登场型高光时刻的标准相对帧 |

## 5. 版式规律
- **标题卡**：中心 (640,345–372)，Noto 900 80px scaleX .85 + 下方 3px 白短线 300 宽 + Exo 2 副标 y≈470；章序号 Orbitron 54px 金在 y268。
- **流程图**：节点 Pill 150×44 或 Box 200×70，间距 200，箭头 38–70 宽 shaft 3 headL 22–24；当前节点金、已过灰底、未到灰边。
- **卡片阵列**：卡 150×92 r8，列距 24，2 帧错峰入场；≥12 张时缩到 70 宽。
- **左右对比**：左 x≈300–380 / 右 x≈900–1000，各配标签 Pill 在上方 y≈250；中间放 ≈ / vs / + 符号 46–60px。
- **图表卡**：440×300 白边黑底，网格 #354552 1px，坐标字 15–18px，曲线金 3px，重点蓝灰点。
- **公式**：Times Italic 34px 逐 token 绝对定位，每 3 帧出一个 token；灰小字注参数（k=60）。
- **标签 + 说明**：Pill（金/蓝灰）在上，Noto 24px 白说明在下 12px。
- **信息层级**：一帧一个焦点；说明字灰 #97A4AE；数字用 Orbitron 蓝灰。
- **尺寸三档与光**（细则 `composition-and-light.md`）：主角 ≥170px 或大字 ≥96px 以对比突出，微光可选；配角 60–110；标签 22–30。上表里的卡 150×92、Pill 150×44 都是**配角尺寸**，不能当主角用；表现「多」用方点阵列，旧平面 MG 背景用幕底；新三维与 H3 空间环境按 `spatial-motion-direction.md` 服务于主题与结构，不加无关碎屑。

## 6. 审美设计与成片终审

分镜前按 `taste-video-review.md` 写 `script/visual_direction.md`，用主题与叙事决定主角、构图和媒介，不用通用卡片或特效代替题材。借鉴 taste-skill 的“一屏一意、共同边线、一个设计系统、一个视觉世界、动效有目的”，保留用户已确认的深海黑金与本项目的视频规范。

成片后按同一参考的八个维度评审实际导出视频，报告用 `taste-review-report-template.md`。完整通看负责节奏和理解，逐帧负责排版与边界；不将代码编译成功或量化检查通过等同于审美通过。上游网页规则的映射、适用边界与许可均在参考中说明。
