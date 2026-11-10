import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {Fonts} from '../common/lib';
import {SceneTrack} from '../common/SceneTrack';
import {compileSceneTimeline} from '../common/sceneTimeline';
import type {SceneSpec, SceneLayer} from '../common/sceneTypes';
import {Heading, Mechanism, PreviewChrome, Synthesis, type Topic} from './ScienceGraphics';
import media from './assets.json';

const makeScenes = (topic:Topic): SceneSpec[] => {
  const source=media.find(m=>m.kind==='video' && m.src.includes(topic))!;
  if (!source || typeof source.sourceDurationSeconds !== 'number' || typeof source.sourceFps !== 'number') throw new Error(`Missing verified video metadata for ${topic}`);
  const Intro=()=> <Heading topic={topic}/>;
  const Observe=()=> <Heading topic={topic} phase="observe"/>;
  const Explain=()=> <Mechanism topic={topic}/>;
  const Finish=()=> <Synthesis topic={topic}/>;
  // The renderer is topic-independent; only assets, graphics and motion keys vary here.
  const image: SceneLayer={id:'photograph',kind:'image',role:'subject',order:0,src:`assets/scene-demo/${topic}.jpg`,
    viewport:{x:530,y:126,width:678,height:430,radius:18},fit:'cover',
    filter:topic==='solar'?'grayscale(1) sepia(.8) saturate(1.1)':'saturate(.8) contrast(1.04)'};
  const video: SceneLayer={id:'observation',kind:'video',role:'subject',order:0,src:source.src,
    sourceInSeconds:0,sourceDurationSeconds:source.sourceDurationSeconds,sourceFps:source.sourceFps,
    viewport:{x:510,y:126,width:698,height:430,radius:18},fit:'cover',
    filter:topic==='solar'?'grayscale(1) sepia(.8) saturate(1.1)':'saturate(.8) contrast(1.04)'};
  return [
    {id:'image',start:0,duration:72,layers:[{...image,motion:[{frame:0,scale:.88,x:80,y:35},{frame:18,scale:1,x:0,y:0},{frame:71,scale:1.08,x:-20,y:-4}]},
      {id:'intro',kind:'graphic',role:'annotation',order:2,Comp:Intro}],beats:[{at:0,duration:45,subject:topic,action:'进入并推进观察区域'}]},
    {id:'video',start:72,duration:96,layers:[{...video,motion:[{frame:0,scale:1.08,x:-20,y:-4},{frame:30,scale:1,x:0,y:0},{frame:95,scale:1.04,x:-12,y:0}]},
      {id:'annotation',kind:'graphic',role:'annotation',order:2,Comp:Observe}],beats:[{at:0,duration:80,subject:topic,action:'跟随真实影像中的主体动作'}]},
    {id:'graphic',start:168,duration:96,layers:[{id:'mechanism',kind:'graphic',role:'subject',order:0,Comp:Explain}],
      camera:[{frame:0,scale:.94,x:20,y:18},{frame:28,scale:1.02,x:0,y:0},{frame:70,scale:1,x:0,y:0}],
      beats:[{at:0,duration:26,subject:topic,action:'显露结构'},{at:26,duration:44,subject:'机制与曲线',action:'沿路径运动并揭示过程'}]},
    {id:'mixed',start:264,duration:96,layers:[{...(topic==='solar'?image:video),id:'context',viewport:{x:72,y:244,width:540,height:300,radius:16},
      motion:[{frame:0,scale:1},{frame:22,scale:1},{frame:80,scale:1.025}]},
      {id:'synthesis',kind:'graphic',role:'annotation',order:2,Comp:Finish}],beats:[{at:0,duration:60,subject:'现象与解释',action:'对齐画面并建立对照'}]},
  ];
};

const plans=Object.fromEntries((['solar','volcano'] as const).map(topic=>[topic,compileSceneTimeline(makeScenes(topic),[
  {fromScene:'image',toScene:'video',preset:'dissolve',durationFrames:18},
  // A clean cut protects text when the observation and diagram layouts differ.
  {fromScene:'video',toScene:'graphic',preset:'cut'},
  // Match the heading and completed plot; replace only the mechanism with observation.
  {fromScene:'graphic',toScene:'mixed',preset:'reveal',durationFrames:18,direction:'right'},
],360,30)]));

export const MixedMediaPreview: React.FC<{topic:Topic}> = ({topic}) => <AbsoluteFill>
  <Fonts/>
  <Audio src={staticFile(`assets/scene-demo/${topic}-narration.wav`)}/>
  <SceneTrack plan={plans[topic]}/>
  <PreviewChrome topic={topic}/>
</AbsoluteFill>;
export const SolarPreview: React.FC = () => <MixedMediaPreview topic="solar"/>;
export const VolcanoPreview: React.FC = () => <MixedMediaPreview topic="volcano"/>;
