# anything2explainer

[![Claude Code](https://img.shields.io/badge/Claude%20Code-skill-D97757?logo=anthropic&logoColor=white)](https://claude.com/claude-code)
[![Codex](https://img.shields.io/badge/Codex-skill-000000)](https://openai.com/codex)
[![Remotion](https://img.shields.io/badge/Remotion-4.0-0B84F3)](https://remotion.dev)
[![License](https://img.shields.io/badge/license-PolyForm%20Noncommercial-informational)](LICENSE)

**English** | [简体中文](README_ZH.md)

**Topic in, narrated explainer video out.** anything2explainer is a [Claude Code](https://claude.com/claude-code) / [Codex](https://openai.com/codex) skill that turns any topic into a deep-navy-and-gold motion-graphics explainer video with TTS voiceover, subtitles and a chapter progress bar, in Chinese or English. Charts, numbers, tables and structured graphics are drawn in code with [Remotion](https://remotion.dev) by default; research also prepares topic-related images/videos, with available MiniMax-H3 tools creating original scenes, process demonstrations and visual metaphors. Primary media is preferred for factual evidence; check content, source/usage conditions, quality and purpose before adoption, and keep unknown items pending.

It is not a CLI. What ships here is the whole method an AI coding agent needs to finish the film: a compilable Remotion template, a primitives and lighting library, tooling for voiceover / storyboard / rendering / quantitative QC, written style and motion specs, a multi-agent division-of-labour protocol, and one complete reference film as the quality bar.

**English cut** — *RAG & Knowledge Bases*, 5′02″, 44 lines / 785 words, voiced by kokoro-82m `am_liam` at natural speed:

https://github.com/user-attachments/assets/e2771c68-a28c-4459-ac5a-a5b685181eeb

**Chinese cut** — *RAG 与知识库* v2, 4′54″, 44 lines / 1490 characters, dot-field backdrop (`bg: 'dots'`), voiced through the bring-your-own-TTS path (Volcengine TTS 2.0 + forced alignment):

https://github.com/user-attachments/assets/5c213990-cbba-439e-8371-fbb3aa348e05

Both cuts share one storyboard and 44 shots; the English cut re-times every shot to the English voiceover. The full paper trail of the original Chinese cut (4′35″, star-field backdrop, 8 build agents in parallel for 40 minutes, two QC rounds) lives in [`examples/rag/`](examples/rag/) (research → narration → storyboard → shot source → QC reports → delivery notes); rendered frames are in [`examples/rag/frames/`](examples/rag/frames/).

## What it does

- **Input**: a topic ("explain vector databases"), or an article / document you want turned into a video. You also pick the length and the language.
- **Output**: a 1280×720 H.264 MP4 with synchronized voiceover, word-boundary-aligned subtitles, chapter cards, a top HUD and a bottom chapter progress bar, plus the full paper trail (research doc with sources, narration, storyboard, per-shot source code, QC reports).
- **How**: the agent researches the topic with sources, writes the narration, generates the voiceover and frame-accurate timeline, storyboards every shot, then builds the selected scene mode independently or with authorized delegation. Technical checks and a complete final-film review with sound precede delivery.
- **Time**: the legacy 2D workflow provides a rough 1–3 hour reference; actual 3D, HD media and generated footage require their own render and tool measurements. Existing decisions and authorization are reused; questions are reserved for missing key inputs or scope changes.

## Output spec

| | |
|---|---|
| Frame / rate | 1280×720 @ 30fps, H.264 |
| Length | your call (see table below); 2–8 minutes all work |
| Language | Chinese or English (`lang` in `src/config.ts`); typography, subtitle budgets and TTS switch with it |
| Look | black canvas with one of two backdrops, star field + fog gradient or dot-field wave (`bg` in `src/config.ts`; the dot-field wave is ported from video-talkcraft); off-white line art + sand-gold accents + blue-grey comparisons; ultra-bold headline type |
| Persistent layers | 44px white-on-black-stroke subtitles, bottom chapter progress bar, top capsule HUD, optional pipeline rail |
| Voiceover | Chinese: edge-tts `zh-CN-YunxiNeural` (Yunxi, male, unmodified rate ≈5.5 chars/s). English: kokoro-82m `am_liam` (Liam, male). Or bring your own TTS / finished audio |

The following estimates describe the legacy flat ShotDef workflow, not quotas for new scenes, agent counts or render time. Short and spatial films follow their actual narration, actions and render measurements:

| Length | Chinese chars | English words | Lines / shots | Historical delegation | Wall clock | Disk |
|---|---|---|---|---|---|---|
| 2–3 min | 650–880 | 280–420 | 24–32 | 4–6 | ≈1 h | ≈2 GB |
| 3–5 min (reference tier) | 1100–1400 | 420–700 | 40–50 | 8 | ≈2 h | ≈2 GB |
| 5–8 min | 1650–2200 | 700–1150 | 60–80 | 10–14 | ≈2–3 h | ≈3 GB |

Choose chapters, scenes and reading windows from the content and actual voiceover. SceneSpec does not inherit fixed legacy holds or the one-camera-move-per-shot limit. See [production workflow](reference/production-workflow.md) for the current process and [narration and storyboard](reference/narration-storyboard.md) for voiceover formats and legacy examples.

## Install

```bash
git clone https://github.com/chenyubing-tech/anything2explainer.git
ln -s "$PWD/anything2explainer" ~/.claude/skills/anything2explainer   # Claude Code
ln -s "$PWD/anything2explainer" ~/.codex/skills/anything2explainer    # Codex
```

Dependencies:

```bash
# Node ≥18 (the template's npm install pulls remotion 4.0.507 / react 19)
brew install ffmpeg          # frame extraction / transcoding, required

python3 -m venv ~/.venvs/a2e && source ~/.venvs/a2e/bin/activate
pip install 'edge-tts==7.2.8' numpy pillow scipy   # pin edge-tts: it tracks a Microsoft endpoint and breaks across upgrades (7.2.0+ needs word boundaries requested explicitly; the script does)

# only needed for English narration (kokoro-82m runs locally)
pip install kokoro soundfile && brew install espeak-ng
```

`scipy` is used by the legacy QC script `frame_metrics.py`. Shell commands require zsh, rsync and related tools. Template checks and sample renders have been verified with native Node/Remotion commands on Windows; see [platform commands](reference/production-workflow.md#4-平台与命令). This Windows review did not verify the full Unix scaffolding pipeline.

### Linux / Raspberry Pi (ARM)

Verified on a Raspberry Pi 5 (ARM64, Python 3.13). Three things differ from macOS:

```bash
sudo apt install zsh espeak-ng                 # scripts are #!/bin/zsh; espeak-ng for kokoro/piper G2P

# Remotion has no linux-arm64 headless browser → point it at system Chromium:
sudo apt install chromium                       # or chromium-browser
export REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium   # read by template/remotion.config.ts (no-op on macOS)
```

**TTS on Linux/ARM.** `kokoro` (the default English engine) is hard to install on ARM/Python 3.13 (it pins an old numpy and pulls spaCy → blis, which lack aarch64 wheels). Two local engines that install cleanly instead — pass one via `TTS_ENGINE`:

```bash
# kokoro_onnx — natural voice, onnxruntime (no torch/spaCy). Download model + voices from
#   github.com/thewh1teagle/kokoro-onnx releases (kokoro-v1.0.onnx, voices-v1.0.bin)
pip install kokoro-onnx
TTS_ENGINE=kokoro_onnx KOKORO_ONNX_MODEL=…/kokoro-v1.0.onnx KOKORO_ONNX_VOICES=…/voices-v1.0.bin \
  KOKORO_ONNX_VOICE=am_michael python3 scripts/tts_build.py

# piper — fastest local, robotic; a Pi-native fallback. Voice .onnx from github.com/rhasspy/piper
pip install piper-tts
TTS_ENGINE=piper PIPER_MODEL=…/en_US-ryan-medium.onnx python3 scripts/tts_build.py
```

The `edge` engine (natural, free, word-boundary timing) also works on Linux and needs no local model — it's a cloud call to Microsoft: `TTS_ENGINE=edge VOICE=en-US-AndrewNeural python3 scripts/tts_build.py`.

## Usage

In Claude Code or Codex, just say what you want. The skill triggers itself:

> Make me an explainer video about vector databases.

> 讲一下向量数据库，做成一条讲解视频

For a new film, follow [production workflow](reference/production-workflow.md) from research and narration through storyboard, assets, construction and review. Reuse existing decisions and authorization; local edits stay within their requested scope. Delegation depends on authorization and actual tools, without a fixed agent count.

New mixed-media and spatial films use SceneSpec; see [scene composition](reference/scene-composition.md) and [spatial motion](reference/spatial-motion-direction.md). H3 requires an available generation tool. Without one, deliver the plan and disclose pending assets; prompts are not generated footage.

The legacy ShotDef template can also be driven by hand (use actual composition names and production-workflow commands for SceneSpec):

```bash
template/scripts/new_project.sh ~/work/my-video myslug
cd ~/work/my-video
# 1. research/调研.md          2. script/narration.txt → python3 scripts/tts_build.py
# 3. script/storyboard_src.md → python3 scripts/render_storyboard.py     4. edit src/config.ts
# 5. src/shots/G1..Gn          6. scripts/preview.sh 30   (first 30 seconds)
# 7. VER=v1 scripts/render.sh + python3 scripts/frame_metrics.py         8. QC → fix → v2/v3
```

## Four production inputs and review artifacts

These are inputs and review artifacts for a new film. Existing decisions and authorization carry forward; local edits do not restart the entire process. See [production workflow](reference/production-workflow.md):

1. **Length and language**: before the script is written. Length sets the content scope; delegation and concurrency depend on the environment and authorization; language flips `lang` in `src/config.ts`, which drives typography, subtitle budgets and the default voice.
2. **Narration sign-off**: before voiceover. Changed copy requires realigning audio, captions and scenes; scenes with local clocks do not require rewriting every absolute shot frame.
3. **Voiceover**: reuse the voice already selected; ask only for genuinely missing key input. Otherwise defaults apply (edge-tts Yunxi for Chinese, kokoro-82m Liam for English). You can also hand over finished audio and fill the per-line timeline yourself.
4. **First 30 seconds**: verify a segment containing the key action and handoff. Longer films may start with 30 seconds; short demos use their actual action length. Approved samples carry forward without restarting confirmation.

## How it compares

| Tool class | What it produces | Where anything2explainer differs |
|---|---|---|
| Generative video models (Sora, Veo, Runway) | Footage synthesized from a prompt | Code guarantees precise data and typography while combining sourced media, code-driven 3D and available generated footage. Code is editable by frame; generated media may require reselection or regeneration |
| Avatar / presenter tools (HeyGen, Synthesia) | A digital presenter reading a script | No presenter. Motion-graphics diagrams that show the mechanism, with the narration driving the visuals |
| Remotion or Motion Canvas by hand | A programmable video canvas | Ships the method on top of the canvas: research → narration → storyboard → construction → technical and aesthetic review, with style specs, motion vocabulary and a reference film to match |
| Manim | Python mathematical animations | An agent-driven end-to-end pipeline with TTS-aligned subtitles, chapters and QC; React / TypeScript rather than Python |

## FAQ

**Which AI coding agents does it work with?**
It is written for Claude Code and Codex, and those two are what it has been run with. The skill itself is plain Markdown plus a Remotion project, so any agent that reads `SKILL.md`-style skill folders and can run shell commands should be able to follow it.

**Does it need a GPU?**
Flat MG can render through headless Chromium on CPU. Real 3D requires working WebGL; software rendering or GPU availability and performance must be measured on the actual machine. Chinese edge-tts uses a cloud endpoint; English kokoro-82m can run locally on CPU.

**Can I use my own voice or a different TTS?**
Yes. Put the finished audio at `public/assets/<slug>/audio.wav` and fill `src/common/timeline.ts` and `subs.ts` by hand (format documented at the top of `tts_build.py`). Everything downstream is unchanged.

**Can I change the visual style?**
Deep Sea Black & Gold is the default, defined in `src/theme.ts`. `config.bg` switches the legacy flat backdrop; new scenes and 3D may use topic-specific environments, geometry and materials while sharing palette, typography and readability. See [style guide](reference/style-guide.md).

**Are the renders reproducible?**
Animation and seeded randomness give the same parameters at the same frame. Rendered pixels also depend on media, fonts, browser and WebGL environment; pixel identity across machines is not guaranteed.

**Can I use it commercially?**
The toolkit is licensed under PolyForm Noncommercial: free for noncommercial use, commercial use requires prior authorization from the author. The videos you make with it are yours. See [License](#license).

**Does it do vertical (9:16) video?**
Not currently. The template and every safe-area rule assume 1280×720 landscape.

**Which languages?**
Chinese and English. Each has its own pacing model, subtitle budget and default voice. Both cuts are embedded at the top of this page; the written paper trail in `examples/rag/` is from the Chinese cut.

## Repo layout

```
SKILL.md                  scope, production modes, current rules and reference routing
reference/                specs written for the main session and the agents
  style-guide.md            safe areas, palette, fonts, primitive catalogue, layout habits
  motion-vocabulary.md      entrance / emphasis / light / exit / camera formulas and frame counts
  composition-and-light.md  three size tiers, light follows the hero, set-piece choreography, QC metrics
  narration-storyboard.md   how to write narration, voiceover params, storyboard tokens, shot pattern table
  research-brief.md         researcher prompt and fact rules
  agent-build-rules.md      build-agent protocol
  agent-qc-rules.md         QC-agent protocol
  prompts.md                six prompt templates: research / build / QC / fix / recheck / final pass
  lessons.md                every trap hit across three films, with root causes
template/                 the compilable Remotion 4 project (copy it with scripts/new_project.sh)
  src/common/               fog, star field, dot-field wave, glitch, easings, subtitles, progress bar, footage layer
  src/ui.tsx  src/fx.tsx    primitives and palette / light, depth and camera primitives
  src/overlay/              title, chapter cards, HUD, pipeline rail, ending
  scripts/                  voiceover, storyboard, stills, test render, 30s preview, full render, QC metrics
  public/fonts/             four fonts + their OFL license
examples/rag/             the reference film's full paper trail and rendered frames
examples/contrast/        6 bad/good frame pairs — the yardstick for composition and light
```

## Acknowledgements

The visual language and the quality bar are inspired by the Douyin creator **@图灵宇宙** — black canvas, white line art with purple accents, ultra-bold headline type: that vocabulary was learned from their videos. Everything in this repo is drawn from scratch in code; none of their frames, assets or project files are used. If you feel this crosses a line, please open an issue.

The default palette is **Deep Sea Black & Gold**: background `#101821`, accent `#CFB47F`, secondary `#91AABC`, text `#ECEEF0`, muted `#97A4AE`, success `#9DB8A7`. The template uses restrained, optional glow. The RAG example retains its historical palette; use it for layout and timing references.

## Originality

- **Structured graphics are drawn in code; key media may be cited.** Charts, numbers, tables and process diagrams stay code-drawn. Key images or videos may come from the research asset list and may include a citation title when useful; record the source, usage conditions, purpose and related fact or shot before adoption. Unknown conditions stay pending; optional file hashes identify the checked version. Use primary media for factual evidence and actively create distinct MiniMax-H3 scenes for processes, spatial relationships and visual metaphors. Mark generated assets as AI-generated; see [generated video direction](reference/generated-video-direction.md).
- **Every fact is sourced.** Every number, year, organisation and English term shown on screen must trace back to a source URL in that film's research document. Anything unverified stays off the screen and out of the narration.

## License

The toolkit: [PolyForm Noncommercial 1.0.0](LICENSE) — free for noncommercial use; commercial use requires prior authorization from the author. **Videos you make with it are yours.**
The four bundled fonts (Noto Sans SC / Orbitron / Exo 2 / Audiowide) are licensed separately under SIL OFL 1.1; see [`template/public/fonts/LICENSE.md`](template/public/fonts/LICENSE.md).
Remotion itself has its own license terms for companies — see [remotion.dev/license](https://remotion.dev/license).

## Known limits

- Chinese and English are both supported (`lang: 'zh' | 'en'`), each with its own pacing, subtitle budget (16 chars / 48 characters per block) and default voice. Both cuts are embedded above; the paper trail in `examples/rag/` is from the Chinese cut. Deep Sea Black & Gold is the default; the two `bg` backdrops belong to the legacy flat mode, while new scenes use environments appropriate to the subject.
- Not for: replicating an existing video, talking-head presenter footage, or films that are mostly live action.
- Narration edits require realigning affected audio, captions and scenes. Update absolute ranges for legacy ShotDef or local beats and boundaries for SceneSpec.
- Parallel builds consume additional disk and memory; choose concurrency from actual host capacity and authorization rather than a fixed agent or pane count.

## Star History

<a href="https://www.star-history.com/?type=date&repos=Vincentwei1021%2Fanything2explainer">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=Vincentwei1021/anything2explainer&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=Vincentwei1021/anything2explainer&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=Vincentwei1021/anything2explainer&type=date&legend=top-left" />
 </picture>
</a>

## Design taste and final-film review

Adapted from [taste-skill](https://github.com/Leonxlnx/taste-skill): subject-led visuals, clear hierarchy, aligned edges, one visual world, purposeful motion and evidence-based finish reviews. The [video review rules](reference/taste-video-review.md) connect a pre-storyboard direction card to a complete final-film viewing, per-shot checks and revision evidence; use the [report template](reference/taste-review-report-template.md). This is a video adaptation, not the upstream browser checker or Stop hook, and preserves the approved navy-and-gold palette. Attribution, source revision and MIT license: [third-party notices](THIRD_PARTY_NOTICES.md).

## Mixed-media scenes

Compose images, videos and code graphics in a shared scene with one boundary clock (18 frames total by default). See [scene composition](reference/scene-composition.md) for timing, source mapping, migration and checks. The template includes two narrated 15-second compositions, `MixedSolar` and `MixedVolcano`, using actual NASA media. These are cross-topic renderer demonstrations, not H3-generated outputs.

`SpatialVolcano` adds a code-generated 3D cutaway and a camera flight through the gas conduit to the existing volcano preview. Select it in Studio, or render it with `npx remotion render src/index.ts SpatialVolcano`. It uses Three.js and `@remotion/three`; the model is an explanatory abstraction, not a physical simulation or H3 output. See the [validation record](template/qc/spatial-volcano-validation.md).
