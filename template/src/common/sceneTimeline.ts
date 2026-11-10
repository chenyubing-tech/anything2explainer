import type {BoundarySpec, CompiledBoundary, MotionKey, ScenePlan, SceneSpec} from './sceneTypes';

export const DEFAULT_TRANSITION_FRAMES = 18;
export const transitionWindow = (at: number, duration = DEFAULT_TRANSITION_FRAMES) => {
  if (!Number.isInteger(duration) || duration < 0) throw new Error('Transition duration must be a non-negative integer');
  const pre = Math.floor(duration / 2);
  return {start: at - pre, end: at + duration - pre, pre, post: duration - pre, duration};
};
export const clampFrame = (frame: number, duration: number) => Math.max(0, Math.min(duration - 1, frame));
const integer = (value: number, name: string, min = 0) => {
  if (!Number.isInteger(value) || value < min) throw new Error(`${name} must be an integer >= ${min}`);
};
const finite = (value: number, name: string, min = -Infinity) => {
  if (!Number.isFinite(value) || value < min) throw new Error(`${name} must be finite and >= ${min}`);
};
const validateMotion = (keys: MotionKey[] | undefined, duration: number, name: string) => {
  keys?.forEach((key, i) => {
    integer(key.frame, `${name}.frame`);
    if (key.frame >= duration || (i > 0 && key.frame <= keys[i - 1].frame)) throw new Error(`${name}: keys must be ordered inside the scene`);
    for (const field of ['x', 'y', 'scale', 'rotate', 'opacity'] as const) {
      if (key[field] !== undefined) finite(key[field]!, `${name}.${field}`, field === 'scale' ? 0.001 : field === 'opacity' ? 0 : -Infinity);
    }
    if ((key.opacity ?? 1) > 1) throw new Error(`${name}: opacity > 1`);
  });
};

export const boundaryProgress = (frame: number, boundary: CompiledBoundary) => {
  if (boundary.durationFrames <= 1) return frame >= boundary.at ? 1 : 0;
  return Math.max(0, Math.min(1, (frame - boundary.start) / (boundary.durationFrames - 1)));
};
export const easeProgress = (progress: number) => 0.5 - 0.5 * Math.cos(Math.PI * progress);
export const revealClip = (progress: number, direction: BoundarySpec['direction'] = 'left') => {
  const hidden = (100 * (1 - progress)).toFixed(5);
  if (direction === 'right') return `inset(0 0 0 ${hidden}%)`;
  if (direction === 'up') return `inset(${hidden}% 0 0 0)`;
  if (direction === 'down') return `inset(0 0 ${hidden}% 0)`;
  return `inset(0 ${hidden}% 0 0)`;
};

export const compileSceneTimeline = (scenes: SceneSpec[], specs: BoundarySpec[], totalFrames: number, fps: number): ScenePlan => {
  integer(totalFrames, 'totalFrames', 1);
  finite(fps, 'fps', 0.001);
  if (!scenes.length) throw new Error('At least one scene is required');
  const ids = new Set<string>();
  scenes.forEach((scene, i) => {
    if (!scene.id || ids.has(scene.id)) throw new Error(`Duplicate or empty scene id: ${scene.id}`);
    ids.add(scene.id);
    integer(scene.start, `${scene.id}.start`);
    integer(scene.duration, `${scene.id}.duration`, 1);
    if (scene.background && !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(scene.background)) throw new Error(`${scene.id}: use an opaque hex background for compositing`);
    const expected = i === 0 ? 0 : scenes[i - 1].start + scenes[i - 1].duration;
    if (scene.start !== expected) throw new Error(`${scene.id}: gap or nominal overlap at frame ${expected}`);
    if (!scene.layers.length) throw new Error(`${scene.id}: empty layers`);
    const layers = new Set<string>();
    scene.layers.forEach((layer) => {
      if (!layer.id || layers.has(layer.id)) throw new Error(`${scene.id}: duplicate or empty layer id`);
      layers.add(layer.id);
      finite(layer.order, `${layer.id}.order`);
      if (layer.kind !== 'graphic' && !layer.src.trim()) throw new Error(`${layer.id}: missing source`);
      if (layer.viewport) {
        finite(layer.viewport.x, 'viewport.x'); finite(layer.viewport.y, 'viewport.y');
        finite(layer.viewport.width, 'viewport.width', 0.001); finite(layer.viewport.height, 'viewport.height', 0.001);
        finite(layer.viewport.radius ?? 0, 'viewport.radius', 0);
      }
      validateMotion(layer.motion, scene.duration, layer.id);
      if (layer.kind !== 'graphic') validateMotion(layer.contentMotion, scene.duration, `${layer.id}.contentMotion`);
      if (layer.kind === 'video') {
        finite(layer.sourceInSeconds, `${layer.id}.sourceInSeconds`, 0);
        finite(layer.sourceDurationSeconds, `${layer.id}.sourceDurationSeconds`, 0.001);
        finite(layer.sourceFps, `${layer.id}.sourceFps`, 0.001);
        const rate = layer.playbackRate ?? 1;
        finite(rate, `${layer.id}.playbackRate`, 0.001);
        // trimBefore is quantized in composition frames; include that rounding in the check.
        const sourceStart = Math.round(layer.sourceInSeconds * fps) / fps;
        const lastTime = sourceStart + (scene.duration - 1) / fps * rate;
        if (lastTime >= layer.sourceDurationSeconds) throw new Error(`${layer.id}: source video is too short for the selected range`);
      }
    });
    validateMotion(scene.camera, scene.duration, `${scene.id}.camera`);
    scene.beats?.forEach((beat) => {
      integer(beat.at, 'beat.at'); integer(beat.duration, 'beat.duration', 1);
      if (beat.at + beat.duration > scene.duration) throw new Error(`${scene.id}: beat outside scene`);
    });
  });
  const last = scenes[scenes.length - 1];
  if (last.start + last.duration !== totalFrames) throw new Error('Scenes must cover totalFrames exactly');
  const boundaries: CompiledBoundary[] = [];
  const seen = new Set<string>();
  for (const spec of specs) {
    const from = scenes.findIndex((s) => s.id === spec.fromScene);
    if (from < 0 || scenes[from + 1]?.id !== spec.toScene) throw new Error('A boundary must connect adjacent scenes in order');
    if (seen.has(spec.fromScene)) throw new Error(`Duplicate boundary: ${spec.fromScene}`);
    seen.add(spec.fromScene);
    const requested = spec.durationFrames ?? DEFAULT_TRANSITION_FRAMES;
    integer(requested, 'durationFrames');
    const durationFrames = spec.preset === 'cut' ? 0 : requested;
    const at = scenes[from + 1].start;
    const start = at - Math.floor(durationFrames / 2);
    if (start < scenes[from].start || start + durationFrames > scenes[from + 1].start + scenes[from + 1].duration) throw new Error('Transition extends beyond its adjacent scenes');
    boundaries.push({...spec, durationFrames, at, start, end: start + durationFrames});
  }
  boundaries.sort((a, b) => a.at - b.at);
  boundaries.forEach((b, i) => {
    if (b.start < 0 || b.end > totalFrames) throw new Error('Transition extends outside the composition');
    if (i && b.start < boundaries[i - 1].end) throw new Error('Transitions overlap; shorten them or lengthen the scenes');
  });
  return {
    totalFrames, fps, boundaries,
    scenes: scenes.map((scene) => {
      const incoming = boundaries.find((b) => b.toScene === scene.id);
      const outgoing = boundaries.find((b) => b.fromScene === scene.id);
      return {scene, incoming, renderStart: incoming ? Math.min(scene.start, incoming.start) : scene.start,
        renderEnd: outgoing ? Math.max(scene.start + scene.duration, outgoing.end) : scene.start + scene.duration};
    }),
  };
};

/** Deterministic keys; each channel interpolates only between keys that specify it. */
export const motionAt = (frame: number, keys: MotionKey[] = []) => {
  const result = {x: 0, y: 0, scale: 1, rotate: 0, opacity: 1};
  for (const channel of Object.keys(result) as Array<keyof typeof result>) {
    const points = keys.filter((key) => key[channel] !== undefined);
    if (!points.length) continue;
    const right = points.findIndex((key) => key.frame >= frame);
    if (right <= 0) result[channel] = points[right === 0 ? 0 : points.length - 1][channel]!;
    else {
      const a = points[right - 1], b = points[right];
      const p = easeProgress((frame - a.frame) / (b.frame - a.frame));
      result[channel] = a[channel]! + (b[channel]! - a[channel]!) * p;
    }
  }
  return result;
};
