import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Fonts} from '../common/lib';
import {SceneTrack} from '../common/SceneTrack';
import {compileSceneTimeline} from '../common/sceneTimeline';
import type {SceneSpec, VideoSceneLayer} from '../common/sceneTypes';
import {Heading, Mechanism, PreviewChrome, Synthesis, type Topic} from './ScienceGraphics';
import {layout} from './processTimeline';
import story from './story.json';
import media from './assets.json';
import {SpatialVolcanoMechanism} from './SpatialVolcano';

const makeScenes = (topic:Topic, spatial=false): SceneSpec[] => {
  const videoLayer = (suffix:string): VideoSceneLayer => {
    const source=media.find(m=>m.kind==='video'&&m.src.endsWith(`${topic}-${suffix}.mp4`));
    if(!source || typeof source.sourceDurationSeconds!=='number'||typeof source.sourceFps!=='number')throw new Error(`Missing verified metadata: ${topic}-${suffix}`);
    return {id:suffix,kind:'video',role:'subject',order:0,src:source.src,sourceInSeconds:0,sourceDurationSeconds:source.sourceDurationSeconds,sourceFps:source.sourceFps,viewport:layout.observation,fit:'cover',filter:topic==='solar'?'grayscale(1) sepia(.8) saturate(1.1)':'saturate(.85)'};
  };
  const Intro=()=> <Heading topic={topic}/>;
  const Explain=()=> spatial?<SpatialVolcanoMechanism/>:<Mechanism topic={topic}/>;
  const Finish=()=> <Synthesis topic={topic}/>;
  return [
    {id:'image',start:0,duration:story.scenes.video,layers:[
      {id:'photograph',kind:'image',role:'subject',order:0,src:`assets/scene-demo/${topic}.jpg`,viewport:layout.observation,fit:'cover',filter:topic==='solar'?'grayscale(1) sepia(.8) saturate(1.1)':'saturate(.85)',contentMotion:[{frame:0,scale:1.04},{frame:41,scale:1.08}]},
      {id:'intro',kind:'graphic',role:'annotation',order:2,Comp:Intro}]},
    {id:'video',start:story.scenes.video,duration:story.scenes.mechanism-story.scenes.video,layers:[
      {...videoLayer('clip'),contentMotion:[{frame:0,scale:1.08},{frame:77,scale:1.13,x:-12}]},
      {id:'heading',kind:'graphic',role:'annotation',order:2,Comp:Intro}]},
    {id:'graphic',start:story.scenes.mechanism,duration:story.scenes.mixed-story.scenes.mechanism,layers:[{id:'mechanism',kind:'graphic',role:'subject',order:0,Comp:Explain}],
      beats:[{at:0,duration:story.stageFrames[1],subject:'原因',action:'展示能量或气体的来源'},{at:story.stageFrames[1],duration:story.stageFrames[2]-story.stageFrames[1],subject:'传递',action:'结构变化与粒子沿路径运动'},{at:story.stageFrames[2],duration:story.scenes.mixed-story.scenes.mechanism-story.stageFrames[2],subject:'结果',action:'结果出现，与阶段面板同步'}]},
    {id:'mixed',start:story.scenes.mixed,duration:story.totalFrames-story.scenes.mixed,layers:[
      {...videoLayer('alt'),viewport:layout.media,contentMotion:[{frame:0,scale:1},{frame:80,scale:1.025}]},
      {id:'synthesis',kind:'graphic',role:'annotation',order:2,Comp:Finish}]},
  ];
};
const plans=Object.fromEntries((['solar','volcano'] as const).map(topic=>[topic,compileSceneTimeline(makeScenes(topic),[
  {fromScene:'image',toScene:'video',preset:'dissolve',durationFrames:18},
  {fromScene:'video',toScene:'graphic',preset:'cut'},
  {fromScene:'graphic',toScene:'mixed',preset:'reveal',durationFrames:18,direction:'right'},
],story.totalFrames,story.fps)]));
const spatialPlan=compileSceneTimeline(makeScenes('volcano',true),[
  {fromScene:'image',toScene:'video',preset:'dissolve',durationFrames:18},
  {fromScene:'video',toScene:'graphic',preset:'cut'},
  {fromScene:'graphic',toScene:'mixed',preset:'reveal',durationFrames:18,direction:'right'},
],story.totalFrames,story.fps);

export const MixedMediaPreview: React.FC<{topic:Topic;spatial?:boolean}> = ({topic,spatial=false}) => <AbsoluteFill>
  <Fonts/>
  <Audio src={staticFile(`assets/scene-demo/${topic}-narration.wav`)}/>
  <SceneTrack plan={spatial?spatialPlan:plans[topic]}/>
  <PreviewChrome topic={topic}/>
</AbsoluteFill>;
export const SolarPreview: React.FC = () => <MixedMediaPreview topic="solar"/>;
export const VolcanoPreview: React.FC = () => <MixedMediaPreview topic="volcano"/>;
export const SpatialVolcanoPreview: React.FC = () => <MixedMediaPreview topic="volcano" spatial/>;
