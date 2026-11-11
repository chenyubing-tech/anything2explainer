# 通用科普场景编排：实际接口与用法

图片、视频与代码图形共享一个 `SceneSpec`，按内容选择图层顺序和动态节拍。引擎无题材依赖；`src/previews/` 的太阳物理与地球科学内容只是两份可运行示例。

## 接入

```tsx
import {Stage} from './Main';
import type {SceneSpec, BoundarySpec} from './common';

const scenes: SceneSpec[] = [
  {id: 'observation', start: 0, duration: 90, layers: [
    {id: 'photo', kind: 'image', role: 'subject', order: 0,
      src: 'assets/my-topic/observation.jpg', fit: 'cover',
      motion: [{frame: 0, scale: 1}, {frame: 65, scale: 1.12, x: -20}]},
  ]},
  {id: 'mechanism', start: 90, duration: 90, layers: [
    {id: 'diagram', kind: 'graphic', role: 'subject', order: 0, Comp: Mechanism},
  ]},
];
const boundaries: BoundarySpec[] = [
  {fromScene: 'observation', toScene: 'mechanism', preset: 'reveal', durationFrames: 18, direction: 'left'},
];
// 注册合成的 durationInFrames=180、fps=30；Mechanism 是项目自己的帧驱动组件。
export const MyVideo = () => <Stage scenes={scenes} boundaries={boundaries} />;
```

以上路径是调用方示例，不是仓库自带素材。可直接运行的真实路径见 `template/src/previews/MixedMediaPreview.tsx` 和 `assets.json`。

`Stage` 在新模式保留进度条与字幕（读取本片 config 和时间轴）；配音须显式传 `audio` 开启，路径为 `public/assets/<slug>/audio.wav`。HUD、章节卡等导航通过 `shots` 显式传入，不由场景自动生成；内容应移入 `scenes`。禁止同时传入旧 `footage` 与新场景，避免视频重复挂载。独立预览可直接使用 `SceneTrack`。

## 时钟、边界与层序

- 场景使用 0 起的 `start` 和 `duration`，区间右端不含；顺序连续，精确覆盖合成总帧数。
- 边界只在 `boundaries` 声明一次。默认 18 帧是总长 18 帧，前 9 帧、后 9 帧；17 帧则前 8 后 9。0/1 帧按直接切换处理。
- `dissolve` 保持完整的前场景作为不透明底图，后场景逐渐覆盖；`reveal` 展开后场景；`cut` 直接切换。`background` 使用不透明十六进制颜色。
- 转场按内容选择：不同标题和构图不强行叠化，避免文字重影；遮罩会切碎关键信息时使用 `cut`。保留的图形应对齐位置、尺度和已完成状态，不能切换后重新从零绘制。当前二维预览在观察→原理使用直切，在原理→同场保留标题与已完成的阶段面板，再展开媒体窗口；原无轴曲线已移除。
- 前后扩展渲染钳制到场景首末有效帧。图片运动、图形内部 `useCurrentFrame()` 和视频同样保持；视频不会因为提前出现而抢播源片段。
- `order` 决定同场媒体和代码层序；相邻场景临时叠加由 `SceneTrack` 控制。字幕不随内容相机移动。
- 相机和图层 `motion` 接受 `frame/x/y/scale/rotate/opacity` 关键帧；各通道独立插值。节拍 `beats` 记录动作意图与时段，实际动作仍由关键帧和组件执行，不声称自动理解文字生成动画。
- 媒体的 `contentMotion` 在固定视口内裁切、平移和推近，外框不跟随缩放；`motion` 则移动整个图层。图片接视频时共享同一视口和对应的内部落位，文字也要逐项匹配，不能只检查大标题。

## 视频源映射与检查

视频图层必须提供 `sourceInSeconds`、`sourceDurationSeconds`、`sourceFps`（从真实文件读取），可选 `playbackRate`。源起点按合成 fps 换算给 Remotion，源文件的 fps 由视频解码器处理；不要拿源 fps 直接乘 `trimBefore`。

`compileSceneTimeline()` 校验场景连续性、重复 id、边界关系与重叠、关键帧范围和源视频长度。它不读磁盘。使用 `scripts/check_scene_assets.cjs <清单JSON>` 检查实际文件、可探测视觉流、fps 与时长；清单为 JSON 数组，每项须含 `kind`（`image` / `video`）和 public 相对路径 `src`；视频须含正数 `sourceFps`、`sourceDurationSeconds`，可选正整数 `width` / `height` 和 64 位十六进制 `sha256`。纯代码场景可传空数组，脚本输出 SKIP，不能记作素材验证 PASS。图片最终解码与视频实际取帧还需渲染验证。缺失素材或源时长不足不能用静默循环掩盖。

旧 `ShotDef` 可经 `sceneFromShot()` 转换 1 起含端点区间；旧视频可经 `sceneFromFootage()` 包装保留裁切/模糊/调色关键帧。适配器不自动消除旧组件自带的入退场，迁移镜头需审查重复淡出。新场景的转场只使用 `BoundarySpec`。旧轨道保留兼容入口，其装饰和视频也已统一为总时长口径，但不会因此自动协调旧代码镜头的进退场。

## 强动态的组织

新片优先采用用户确认的 `spatial-motion-direction.md`：空间穿行、主体跨媒体演变、代码图形 3D 化与 H3 原创运动。下述基础编排是实现支撑，不把两段二维预览作为最终动效上限。

按节拍使用主角推进、结构展开、路径运动、参数变化与布局重排。一个场景可多次转换景别，每节拍一个主导运动；HUD 和字幕稳定。关键文字及结论留足阅读时间。新场景不受旧的“每镜头只能一次运镜”限制；`composition-and-light.md` 中的安全区、主次与有语义的持续动作原则仍有效。

跨媒体关系用独立标注层连接：箭头从素材中的标注区域出发，跨过媒体边缘与间隙，抵达图表左边框，不伸入数据区域；放在两块内容上方，避免被各自视口裁切。先完成主体与标注落位，再让箭头沿关系方向生长，避开标题、数据和字幕。真实素材上的线条可用深色细衬底保持对比。`Synthesis` 提供图片/视频→图表的示例，连接是解释关系，不表示从资料画面提取了实测数据。

通用引擎不自带某种科学原理、查询球或文档故事。H3 的共同物体、构图和运动方向在生成前由分镜设计；当前引擎负责层序和时序，没有自动追踪或任意物体 morph。后续可在 graphic 图层接自定义三维或变形组件，或合成实际生成素材，沿用统一时间轴；这些实现需按 `spatial-motion-direction.md` 另行完成和验证，不能把接口存在算作能力已交付。

## 解释联动与开场

第一句话提出可证实的论点、悬念或反问，首画面给出对应对象；接下来立即推进证据或机制，结尾回答开场。按主题选择形式，不机械套反问，也不凭错误前提制造悬念。完整规则见 `narration-guidance.md` §1。

过程示意没有明确横纵轴或变量时，优先画有名称的阶段。确需曲线则标明变量、阶段、定性关系及事实依据，不能用平滑曲线装饰。结构、路径和阶段高亮由同一个过程状态推进；粒子到达出口后再出现结果，相关画面不能只是各自循环。`previews/processTimeline.ts` 是两份样例的状态和布局参数，题材内容不写进通用引擎。

新场景时长按完整动作、旁白与阅读决定，不受旧 `ShotDef` 的 120 帧下限约束；每节拍一个主导运动。同一标题或主体跨边界持续可见时，读取窗口按连续语义段算，不在每次切换机械增加停顿。新信息需要足够读图时间，结论落位后要可读，不能用快速切换掩盖没讲清的过程。

## 本次验证命令

在 `template/` 运行：

```powershell
npm run typecheck
npm run test:scenes
npm run check:scene-assets
$env:REMOTION_BROWSER_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx remotion bundle src/index.ts --out-dir build_scenes
npx remotion render build_scenes MixedSolar renders/MixedSolar.mp4 --concurrency=2
npx remotion render build_scenes MixedVolcano renders/MixedVolcano.mp4 --concurrency=2
python scripts/inspect_scene_preview.py renders/MixedSolar.mp4
python scripts/inspect_scene_preview.py renders/MixedVolcano.mp4
```

Chrome 路径按本机安装调整。检查脚本用 Pillow，ffprobe/ffmpeg 默认使用 Remotion 自带的 Windows 二进制；其他系统可设置 `FFPROBE`/`FFMPEG`。预览素材来源与处理记录见 `template/public/assets/scene-demo/MANIFEST.md`，技术证据与未检查项见 `template/qc/scene-composition-validation.md`。

以上 inspect_scene_preview.py 读取 `src/previews/story.json`，只用于仓库样例，不是任意新视频的通用检查。自定义新片须按本片时间计划复核；实际三维验证入口另见 `SpatialVolcano` 与 `template/qc/spatial-volcano-validation.md`（路径相对仓库根）。
