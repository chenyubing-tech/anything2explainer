# 火山样例：真实三维通道穿行验证

本轮在现有 15 秒火山样例上新增 `SpatialVolcano` 合成，保留 `MixedVolcano` 供比较。输出为 `renders/SpatialVolcano-v1.mp4`；文件 SHA256 与重复帧证据见 `spatial-render-evidence.json`。

## 已实现

- Three.js 网格：七层火山剖面、岩浆区域、沿 Catmull-Rom 路径生成的通道、随路径移动的气体与出口羽流。体积从压扁剖面展开，随后相机进入几何结构并沿通道中心线前进，再从出口拉回整体。
- `@remotion/three` 将 React Three Fiber 与 Remotion 帧时钟同步；模型、相机、颗粒和光源均由局部帧号决定，不从实时 delta 积分运动。
- 同一视频仍为 450 帧 / 30fps / 1280×720 / 15 秒，沿用已有原速中文配音、字幕、前后 NASA 资料及用户确认的末段箭头。
- 三维段位于 `[120,324)`，即 4.0–10.8 秒。约 4.0–4.93 秒展开体积，4.93–5.93 秒进入内部，5.93–8.87 秒沿通道上升，8.87–9.6 秒飞出并回看，9.6–10.53 秒拉回整体，然后接回原同场画面。

这是一个代码三维解释模型。规则通道、环线和颗粒抽象表达路线与运动，不代表真实火山有这种圆管结构，也不是流体或地质仿真。未调用 H3，未实现自动跨媒体主体 morph；外部资料中的火山仍为 NASA 的过程动画。

## 检查结果

| 检查 | 结果 / 证据 |
|---|---|
| TypeScript | 通过 |
| 场景与运动测试 | 共 14 组通过；包含原时间轴与因果测试，以及相机位置/目标有限、阶段衔接无大跳、真实进入三维中心线、固定帧可重复求值 |
| 实际 WebGL 输出 | 本机 Chrome 导出剖面、通道和出口关键帧，再完成实际 MP4 渲染 |
| 独立重复渲染 | 两个独立 Chrome 渲染同一 f225，PNG SHA256 完全一致，见 spatial-render-evidence.json |
| 全帧检查 | 全 450 帧成功解码，30fps，带音轨，无近黑帧；最低帧平均亮度约 30.847 |
| 最终画面定位 | `stills/SpatialVolcano-v1/sheet.jpg`；其 decoded 目录为最终 MP4 的逐帧证据 |

实际修复：首轮近景气泡占屏过大，已减少粒子并排除近于相机的颗粒；剖切辅助面进入通道时会干扰视线，已按镜头阶段淡出；出口增加回看与拉回全貌；加宽模型出口避免通道与口沿干涉；顶部叠层保持文字对比。

没有正常速度完整带声音通看，因此最终视听审美为 NOT_REVIEWED。全帧解码和静帧可验证几何确实渲染、运动路径和遮挡修复，不能替代声音、眩晕感、节奏与科学事实的正式终审。

## 本机复现

在 `template/` 安装依赖后运行 `npm run typecheck`、`npm run test:scenes`。Studio 选择 `SpatialVolcano`，或：

```powershell
$env:REMOTION_BROWSER_EXECUTABLE='C:\Program Files\Google\Chrome\Application\chrome.exe'
npx remotion bundle src/index.ts --out-dir build_spatial
npx remotion render build_spatial SpatialVolcano renders/SpatialVolcano-v1.mp4 --codec=h264 --crf=18 --concurrency=1
python scripts/inspect_scene_preview.py renders/SpatialVolcano-v1.mp4
```

浏览器路径按实际安装调整；WebGL 后端沿用 remotion.config.ts 的配置。本次 npm 安装遗漏了 Windows 可选原生包，定向恢复 `@rspack/binding-win32-x64-msvc@1.7.11` 与 `@remotion/compositor-win32-x64-msvc@4.0.507` 后完成渲染；未删除依赖目录或改全局配置。项目依赖与锁文件不将 Windows 包设为跨平台必需依赖。
