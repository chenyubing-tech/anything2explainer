import story from './story.json';

export const clamp = (n: number) => Math.max(0, Math.min(1, n));
export const processState = (frame: number) => ({
  stage: frame >= story.stageFrames[2] ? 2 : frame >= story.stageFrames[1] ? 1 : 0,
  transfer: clamp((frame - story.stageFrames[1]) / (story.stageFrames[2] - story.stageFrames[1])),
  result: clamp((frame - story.stageFrames[2]) / 36),
});

// All shared anchors are derived from this layout, including the user-approved arrow.
export const layout = {
  observation: {x: 530, y: 126, width: 678, height: 430, radius: 18},
  media: {x: 72, y: 244, width: 540, height: 300, radius: 16},
  panel: {x: 680, y: 180, width: 520, height: 340},
  focus: {x: 122, y: 310, width: 330, height: 120},
};
export const connector = {
  fromX: layout.focus.x + layout.focus.width + 2,
  toX: layout.panel.x,
  y: layout.focus.y + 46,
};
