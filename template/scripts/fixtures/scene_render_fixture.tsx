// Technical fixture: known colors encode source time; the white strip encodes local time.
import React from 'react';
import {AbsoluteFill, Composition, registerRoot, useCurrentFrame} from 'remotion';
import {SceneTrack} from './common/SceneTrack';
import {compileSceneTimeline} from './common/sceneTimeline';
import type {SceneSpec} from './common/sceneTypes';

const Clock = () => {
  const frame = useCurrentFrame();
  return <div style={{position:'absolute', top:0, left:0, width:frame + 1, height:10, background:'white'}} />;
};
const clock = {id:'clock', kind:'graphic' as const, role:'annotation' as const, order:2, Comp:Clock};
const scenes: SceneSpec[] = [
  {id:'a', start:0, duration:30, layers:[{id:'img', kind:'image', role:'subject', order:0, src:'image.png'}, clock]},
  {id:'b', start:30, duration:30, layers:[{id:'vid', kind:'video', role:'subject', order:0, src:'source.mp4',
    sourceInSeconds:0.5, sourceFps:30, sourceDurationSeconds:3, playbackRate:2}, clock]},
  {id:'c', start:60, duration:30, background:'#205030', layers:[clock]},
];
const plan = compileSceneTimeline(scenes, [
  {fromScene:'a', toScene:'b', preset:'dissolve', durationFrames:18},
  {fromScene:'b', toScene:'c', preset:'reveal', direction:'left', durationFrames:18},
], 90, 30);
const Smoke = () => <AbsoluteFill><SceneTrack plan={plan} /></AbsoluteFill>;
registerRoot(() => <Composition id="AuditSmoke" component={Smoke} width={320} height={180} durationInFrames={90} fps={30} />);
