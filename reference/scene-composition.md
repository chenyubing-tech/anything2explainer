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

`Stage` 在新模式保留全局配音、导航、进度条与字幕。`shots` 若传入，只用于显式的覆盖层；内容应移入 `scenes`。禁止同时传入旧 `footage` 与新场景，避免视频重复挂载。独立预览可直接使用 `SceneTrack`。

## 时钟、边界与层序

- 场景使用 0 起的 `start` 和 `duration`，区间右端不含；顺序连续，精确覆盖合成总帧数。
- 边界只在 `boundaries` 声明一次。默认 18 帧是总长 18 帧，前 9 帧、后 9 帧；17 帧则前 8 后 9。0/1 帧按直接切换处理。
- `dissolve` 保持完整的前场景作为不透明底图，后场景逐渐覆盖；`reveal` 展开后场景；`cut` 直接切换。`background` 使用不透明十六进制颜色。
- 转场按内容选择：不同标题和构图不强行叠化，避免文字重影；遮罩会切碎关键信息时使用 `cut`。保留的图表应对齐位置、尺度和已完成状态，不能切换后重新从零绘制。两份预览在观察→原理使用直切，在原理→同场保留标题与曲线并展开媒体窗口。
- 前后扩展渲染钳制到场景首末有效帧。图片运动、图形内部 `useCurrentFrame()` 和视频同样保持；视频不会因为提前出现而抢播源片段。
- `order` 决定同场媒体和代码层序；相邻场景临时叠加由 `SceneTrack` 控制。字幕不随内容相机移动。
- 相机和图层 `motion` 接受 `frame/x/y/scale/rotate/opacity` 关键帧；各通道独立插值。节拍 `beats` 记录动作意图与时段，实际动作仍由关键帧和组件执行，不声称自动理解文字生成动画。

## 视频源映射与检查

视频图层必须提供 `sourceInSeconds`、`sourceDurationSeconds`、`sourceFps`（从真实文件读取），可选 `playbackRate`。源起点按合成 fps 换算给 Remotion，源文件的 fps 由视频解码器处理；不要拿源 fps 直接乘 `trimBefore`。

`compileSceneTimeline()` 校验场景连续性、重复 id、边界关系与重叠、关键帧范围和源视频长度。它不读磁盘。使用 `scripts/check_scene_assets.cjs <清单JSON>` 检查实际文件、可探测视觉流、fps 与时长；图片最终解码与视频实际取帧还需渲染验证。缺失素材或源时长不足不能用静默循环掩盖。

旧 `ShotDef` 可经 `sceneFromShot()` 转换 1 起含端点区间；旧视频可经 `sceneFromFootage()` 包装保留裁切/模糊/调色关键帧。适配器不自动消除旧组件自带的入退场，迁移镜头需审查重复淡出。新场景的转场只使用 `BoundarySpec`。旧轨道保留兼容入口，其装饰和视频也已统一为总时长口径，但不会因此自动协调旧代码镜头的进退场。

## 强动态的组织

按节拍使用主角推进、结构展开、路径运动、参数变化与布局重排。一个场景可多次转换景别，每节拍一个主导运动；HUD 和字幕稳定。关键文字及结论留足阅读时间。新场景不受旧的“每镜头只能一次运镜”限制；`composition-and-light.md` 中的安全区、主次与有语义的持续动作原则仍有效。

跨媒体关系用独立标注层连接：箭头从素材中的标注区域出发，跨过媒体边缘与间隙，抵达图表左边框，不伸入数据区域；放在两块内容上方，避免被各自视口裁切。先完成主体与标注落位，再让箭头沿关系方向生长，避开标题、数据和字幕。真实素材上的线条可用深色细衬底保持对比。`Synthesis` 提供图片/视频→图表的示例，连接是解释关系，不表示从资料画面提取了实测数据。

通用引擎不自带某种科学原理、查询球或文档故事。H3 的共同物体、构图和运动方向在生成前由分镜设计；引擎负责准确执行层序和时序，不做自动追踪或任意物体 morph。

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
