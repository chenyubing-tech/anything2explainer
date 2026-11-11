# 制作流程与验证范围

## 1. 复用上下文，补齐真正缺失的输入

先确定本次是新片、局部修改、审查还是更新规则。局部任务不自动重写文案、重做声音或重跑整片。主题、时长、语言、配色、声音和已认可样例从已有会话继承；已有授权不重复确认。文案、TTS 与样片是可供评审的成果点，不是每轮任务都要重新停下的四道固定门。

关键输入确实缺失或新决定会明显改变内容、费用与交付范围时，先完成独立可做的工作，再问必要问题。默认深海黑金；中文常用 edge-tts 云希原速，英文常用 kokoro `am_liam`。沿用用户已有声音偏好，先核对工具实际可用性。Windows 样例的 SAPI Huihui 是本机示例声音，不因此替代全部新片的默认声音。

## 2. 选择制作模式

- 新混合或空间片优先用 `SceneSpec`，读 `scene-composition.md` 与 `spatial-motion-direction.md`。三维内容可作为 graphic 图层接入统一时间轴。
- 修改旧 G1–Gn 镜头时沿用 `ShotDef`、`timing.ts` 和对应检查脚本。新旧轨道不能重复挂同一媒体；显式迁移时审查旧组件的进退场。
- 新片必须设置自己的内容、素材、声音、时间轴和主合成。模板仍含 RAG 与太阳/火山样例，复制目录或渲染已有样例不能算作新片完成。

## 3. 从调研到交付

| 阶段 | 产出与检查 |
|---|---|
| 研究 | `research/调研.md`、`research/素材清单.md`：问题、机制、边界、事实出处与素材关联；用生成示意不能替代事实证据 |
| 解说与声音 | 第一句话给观看理由，结尾回答；按 `narration-guidance.md` 与 `narration-storyboard.md` 写文本和字幕块，取得实际音频与时间轴；默认不加速硬凑片长 |
| 方向与分镜 | `script/visual_direction.md`、项目分镜：主角、媒介、关键空间动作、相机路线、身份锚点和读取窗口；选用场景、过程和视觉隐喻时设计不同新 H3 素材 |
| 素材与生成 | H3 计划记在 `script/h3_shot_plan.md`，执行实际可用的工具，区分 planned/submitted/generated/accepted/rejected；无工具记待生成，继续独立的代码与设计工作，公开缺口 |
| 构建 | 沿用统一主题，所有动画按帧驱动；新场景用统一边界与源时间；三维、主体变形和 H3 以实际输出确认，不能用倾斜卡片或普通叠化代替已承诺动作 |
| 局部打样 | 取能证明关键动作和承接的实际片段，长度按动作完整性决定；长片可先看前 30 秒，15 秒样例无需强做 30 秒。需要 H3 的片段以实际生成文件验证，无文件时说明尚未验证 |
| 技术与审美 | 先查实际素材、类型、时序和导出，再带声音完整通看并按 `taste-video-review.md` 出报告；未完成完整观看为 NOT_REVIEWED，不把解码或测试当审美 PASS |
| 交付 | 成片、声音/资料出处、源工程、实际检查记录、遗留与能力范围；统计 H3 计划、实际生成、独立采用数和时长，代码三维单列，重复裁切不算独立新生成 |

按实际 TTS 实测时长安排动作，不把旧样片的句数、44 镜头、8 组、3–5 分钟或固定工时当通用配置。章节数服从内容与时长，短片可单章，无需章节卡。文案改变后必须重新对齐声音、字幕与场景，不能复用旧帧号假装同步。

## 4. 平台与命令

`new_project.sh`、`render.sh`、`preview.sh`、`still.sh` 等是 Unix shell 脚本，依赖 zsh/rsync/ffmpeg 等本机工具，不能直接当作原生 PowerShell 命令。使用前读脚本要求，不把固定的 `Video` 或 G1–Gn 当作任意新合成名。

已存在工程的 Windows 验证示例（在实际工程目录执行）：

```powershell
npm ci
npm run typecheck
npm run test:scenes
npm run test:workflow
npm run check:scene-assets
$env:REMOTION_BROWSER_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx remotion bundle src/index.ts --out-dir build_review
npx remotion render build_review SpatialVolcano renders/SpatialVolcano.mp4 --concurrency=1
```

浏览器路径、合成名、输出目录按实际环境修改；新片运行 `node scripts/check_scene_assets.cjs <本片清单JSON>`，不检查完样例就声称新素材通过。三维并发按真实测渲决定，先低并发检查实际 WebGL 输出。`npm ci` 需要锁文件；遇到 npm 缺少平台可选二进制时，按明确缺失包恢复兼容版本，不能盲目删除工程或改全局配置。

`test:workflow` 需要 Python、numpy 和 Pillow，使用隔离项目及本地测试音轨验证文件生成，不调用 TTS 服务。检查真实媒体/边界接入时，设置上述浏览器路径后运行 `npm run check:scene-render`；需要 Python/Pillow 和 ffmpeg，可用 `PYTHON` / `FFMPEG` 指定可执行文件。它复用已安装依赖，在临时工程生成 90 帧技术夹具并实际渲染，核对裁切、2 倍速、18 帧边界、局部时钟和重复帧，结果写入 `qc/scene-render-runtime-evidence.json`；不自动下载浏览器，也不代表声音或审美通过。

Windows 新建工程时可用本机原生复制工具把模板复制到新目录，排除 `node_modules`、`build*`、`renders`、`stills`、`fin_frames`、`audio` 与 `public/assets/scene-demo/raw` 等本地产物；保留源码、字体、包清单和锁文件。修改本片配置，再安装依赖与检查。不要覆盖已有工程，不复制旧的 render.done 或检查结果作为新片证据。

## 5. 哪些检查能证明什么

| 入口 | 范围 | 不能据此宣称 |
|---|---|---|
| `npm run typecheck` | 当前工程类型 | 画面正确、事实正确或成片好看 |
| `npm run test:scenes` | 模板时序、过程、三维路线与素材预检的回归测试 | 任意新片镜头和素材已被覆盖 |
| `npm run test:workflow` | 配音文件输出、分镜令牌、时间映射和旧 QC 的 CLI 回归；本地测试音轨 | 实际 TTS 服务、真实音色或完整新片已验收 |
| `npm run check:scene-render` | 独立技术夹具的实际浏览器渲染与解码像素 | 任意新片、3D/H3、音轨或审美均已覆盖 |
| `check_scene_assets.cjs <清单>` | 清单结构、本片实际文件、视频流的必填 fps/时长及可选尺寸/哈希；空清单为 SKIP | 容器总时长等于画面长度；素材的科学含义或最终观感已通过 |
| `selfcheck.py`、`motion_check.py`、`frame_metrics.py` | 旧 G1–Gn / 分镜结构的静态与图像辅助检查 | 自动支持任意 SceneSpec、三维场景或 H3；旧像素门槛不是新场景的审美裁决 |
| `inspect_scene_preview.py` | 仓库特定样例；读取 `src/previews/story.json` 的片长和边界 | 是任意视频的通用检查器；新片需使用其实际元数据与时间计划 |
| taste 终审 | 实际最终视频完整带声音观看、逐镜头与边界证据 | 未看完整视频、未查声音或只查静帧也可 PASS |

新场景的间隔、重叠、源长度与关键帧由 `compileSceneTimeline` 校验；另按本片分镜检查实际帧、动作、字幕安全区和正常速度阅读。不要拿旧脚本读不到新场景的结果当成“无缺陷”。历史报告只对其指定版本负责，新片或重渲染后需新的证据。

旧 `selfcheck.py` 的退出码为 0（支持的静态检查通过）/ 1（发现问题）/ 2（区间使用动态常量或分组无法解析，检查不完整）；不能把 2 记为通过。`motion_check.py` 缺失成片帧会报 INCOMPLETE 并失败；抽样不足的镜头单列未检查，退出 2；阈值标记退出 1，仍需看帧区分真实缺陷与误报。两者都不替代成片终审。

## 6. 分工是可选实现方式

一个执行者也能完成流程。只有本次授权和环境允许时才分配子任务；任务数量、并发和文件所有权按可用能力设置，不依赖特定宿主的 ListAgents、tmux 或固定模型。采用分工时使用 `prompts.md`，给出实际可修改文件、统一事实与时间依据；新场景与旧镜头分别指定规则。收回任务结果后仍需主流程核对接入、真实文件和整体效果。
