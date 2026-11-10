import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BACKGROUND, BLUE_GREY, GOLD, GOLD_LIGHT, MUTED as GREY, SURFACE, FOREGROUND as WHITE} from '../theme';
import story from './story.json';
import {clamp, connector, layout, processState} from './processTimeline';

export type Topic = 'solar' | 'volcano';
const font = "'Noto Sans SC', sans-serif";
export const topicCopy = {
  solar: {title:<>太阳为什么<br/>会突然爆发？</>, sub:'答案藏在磁场中', action:'磁场重组，能量释放', steps:['磁场储存能量','磁力线重新连接','周围物质升温'], process:'一次耀斑怎样发生', result:'能量释放，耀斑出现'},
  volcano: {title:<>没喷发，<br/>为什么也冒气？</>, sub:'答案藏在岩浆中', action:'气体逸出，形成羽流', steps:['气体从岩浆析出','沿裂隙向上运动','到达地表形成羽流'], process:'气体怎样来到地表', result:'冒气，并不等于正在喷发'},
};

// Both sides of the first dissolve share every text and panel anchor.
export const Heading: React.FC<{topic: Topic}> = ({topic}) => <AbsoluteFill style={{fontFamily:font,pointerEvents:'none'}}>
  <div style={{position:'absolute',left:72,top:170,width:430}}>
    <div style={{color:GOLD,fontSize:22,letterSpacing:4,marginBottom:20}}>问题就在这里</div>
    <div style={{fontSize:57,fontWeight:900,lineHeight:1.28,color:WHITE}}>{topicCopy[topic].title}</div>
    <div style={{width:200,height:3,background:GOLD,marginTop:28}}/>
    <div style={{fontSize:26,color:BLUE_GREY,marginTop:24}}>{topicCopy[topic].sub}</div>
  </div>
</AbsoluteFill>;

const ProcessPanel: React.FC<{topic:Topic;settled?:boolean}> = ({topic,settled=false}) => {
  const f=useCurrentFrame();
  const state=processState(settled ? story.stageFrames[2]+36 : f);
  return <div style={{position:'absolute',left:layout.panel.x,top:layout.panel.y,width:layout.panel.width,height:layout.panel.height,background:SURFACE,border:'1px solid #354552',borderRadius:16,fontFamily:font}}>
    <div style={{position:'absolute',left:30,top:22,color:WHITE,fontSize:27,fontWeight:700}}>{topicCopy[topic].process}</div>
    {topicCopy[topic].steps.map((label,i)=>{
      const active=i===state.stage, reached=i<=state.stage;
      return <div key={label} style={{position:'absolute',left:30,right:30,top:80+i*72,height:58,display:'flex',alignItems:'center',gap:20,color:reached?WHITE:GREY,opacity:reached?1:.55}}>
        <div style={{width:36,height:36,borderRadius:18,border:`2px solid ${reached?GOLD:BLUE_GREY}`,background:active?GOLD:'transparent',color:active?BACKGROUND:GOLD,fontSize:22,fontWeight:800,display:'flex',alignItems:'center',justifyContent:'center'}}>{i+1}</div>
        <div style={{fontSize:29,fontWeight:active?800:500}}>{label}</div>
        {i<state.stage?<div style={{marginLeft:'auto',color:GOLD,fontSize:25}}>✓</div>:null}
      </div>;
    })}
    <div style={{position:'absolute',left:30,bottom:18,color:GREY,fontSize:21}}>机制示意 · 非按比例</div>
  </div>;
};

const ProcessHeading: React.FC<{topic:Topic}> = ({topic}) => <>
  <div style={{position:'absolute',left:72,top:120,color:GOLD,fontSize:22,letterSpacing:4}}>从原因到结果</div>
  <div style={{position:'absolute',left:72,top:157,color:WHITE,fontSize:44,fontWeight:900}}>{topicCopy[topic].action}</div>
</>;

const SolarMechanism: React.FC = () => {
  const f=useCurrentFrame(), {transfer,result}=processState(f);
  const blend=(a:number,b:number)=>a+(b-a)*transfer;
  return <svg width={540} height={300} viewBox="0 0 540 300">
    <ellipse cx={270} cy={254} rx={216} ry={30} fill="#3A3024" stroke={GOLD} strokeWidth={3}/>
    <path d={`M 90,250 C ${blend(80,130)},${blend(55,145)} ${blend(340,400)},${blend(55,145)} ${blend(330,450)},250`} fill="none" stroke={GOLD_LIGHT} strokeWidth={5}/>
    <path d={`M ${blend(210,185)},${blend(250,125)} C ${blend(200,175)},${blend(55,-25)} ${blend(460,455)},${blend(55,-25)} ${blend(450,440)},${blend(250,125)}`} fill="none" stroke={BLUE_GREY} strokeWidth={4}/>
    <circle cx={270} cy={134} r={9+18*Math.sin(transfer*Math.PI)} fill={GOLD_LIGHT} opacity={transfer>0&&transfer<1?.9:0}/>
    <ellipse cx={270} cy={211} rx={170} ry={60} fill={GOLD} opacity={result*.18}/>
    {result>0?Array.from({length:6},(_,i)=>{
      const t=((f-story.stageFrames[2]+i*9)%66)/66;
      const angle=-Math.PI+(i/5)*Math.PI;
      return <circle key={i} cx={270+Math.cos(angle)*(35+t*170)} cy={170+Math.sin(angle)*(20+t*130)} r={5} fill={GOLD_LIGHT} opacity={result*(1-t)}/>;
    }):null}
    <text x={270} y={292} textAnchor="middle" fill={BLUE_GREY} fontSize={22}>磁场中的能量 → 周围物质</text>
  </svg>;
};

const VolcanoMechanism: React.FC = () => {
  const f=useCurrentFrame(), {transfer,result}=processState(f);
  return <svg width={540} height={300} viewBox="0 0 540 300">
    <path d="M 30,280 L 220,92 Q 270,126 320,92 L 510,280 Z" fill="#253442" stroke={BLUE_GREY} strokeWidth={3}/>
    <path d="M 220,92 Q 270,126 320,92" fill="none" stroke={GOLD} strokeWidth={5}/>
    <path d="M 270,264 C 242,208 285,159 270,110" fill="none" stroke="#51616B" strokeWidth={14}/>
    <path d="M 270,264 C 242,208 285,159 270,110" fill="none" stroke={GOLD} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1-transfer}/>
    <ellipse cx={270} cy={265} rx={80} ry={23} fill={GOLD} opacity={.65}/>
    {Array.from({length:8},(_,i)=>{
      // Each parcel travels through the conduit, then exits into the plume.
      const t=(f-story.stageFrames[1]-i*8)/(story.stageFrames[2]-story.stageFrames[1]);
      if(t<0||t>2.2)return null;
      const u=clamp(t), v=clamp(t-1);
      const x=t<=1?270-84*(1-u)*(1-u)*u+45*(1-u)*u*u:270+v*(25+i*9);
      const y=t<=1?264*(1-u)**3+3*208*(1-u)**2*u+3*159*(1-u)*u*u+110*u**3:110-v*96;
      return <circle key={i} cx={x} cy={y} r={5+v*9} fill={i%2?GOLD_LIGHT:BLUE_GREY} opacity={t<=1?1:1-v*.7}/>;
    })}
    {transfer===0?[0,1,2].map(i=><circle key={i} cx={246+i*24} cy={259-clamp(f/32)*i*8} r={5} fill={GOLD_LIGHT}/>):null}
    <text x={380} y={45} fill={result>0?GOLD_LIGHT:BLUE_GREY} opacity={result} fontSize={23}>气体羽流</text>
    <text x={270} y={296} textAnchor="middle" fill={BLUE_GREY} fontSize={22}>岩浆中的气体</text>
  </svg>;
};

export const Mechanism: React.FC<{topic:Topic}> = ({topic}) => {
  const f=useCurrentFrame();
  return <AbsoluteFill style={{fontFamily:font}}>
    <ProcessHeading topic={topic}/>
    <div style={{position:'absolute',left:layout.media.x,top:layout.media.y,opacity:clamp(f/12)}}>{topic==='solar'?<SolarMechanism/>:<VolcanoMechanism/>}</div>
    <ProcessPanel topic={topic}/>
  </AbsoluteFill>;
};

export const Synthesis: React.FC<{topic:Topic}> = ({topic}) => {
  const f=useCurrentFrame(), box=clamp(f/20), link=clamp((f-22)/22);
  const tip=connector.fromX+(connector.toX-connector.fromX)*link;
  return <AbsoluteFill style={{fontFamily:font}}>
    <ProcessHeading topic={topic}/>
    <div style={{position:'absolute',left:layout.focus.x,top:layout.focus.y,width:90+(layout.focus.width-90)*box,height:layout.focus.height,border:`2px solid ${GOLD_LIGHT}`,borderRadius:12,opacity:.7}}/>
    <ProcessPanel topic={topic} settled/>
    {link>0?<svg width={1280} height={720} aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
      {[true,false].map(under=><g key={String(under)} stroke={under?BACKGROUND:GOLD_LIGHT} strokeWidth={under?8:3} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={under?.85:1}>
        <path d={`M ${connector.fromX},${connector.y} H ${tip}`}/>
        <path d={`M ${tip-12},${connector.y-7} L ${tip},${connector.y} L ${tip-12},${connector.y+7}`}/>
      </g>)}
      <circle cx={connector.fromX} cy={connector.y} r={4} fill={GOLD_LIGHT}/>
    </svg>:null}
    <div style={{position:'absolute',left:72,top:570,color:GOLD_LIGHT,fontSize:27,fontWeight:700,opacity:clamp((f-44)/12)}}>{topicCopy[topic].result}</div>
  </AbsoluteFill>;
};

export const PreviewChrome: React.FC<{topic:Topic}> = ({topic}) => {
  const f=useCurrentFrame();
  const caption=[...story.captions[topic]].reverse().find(c=>f>=c.at)!.text;
  const observation=f<story.scenes.mechanism, mixed=f>=story.scenes.mixed;
  return <AbsoluteFill style={{fontFamily:font,pointerEvents:'none'}}>
    <div style={{position:'absolute',left:72,top:32,color:GREY,fontSize:20,letterSpacing:3}}>{topic==='solar'?'太阳物理':'地球科学'}</div>
    <div style={{position:'absolute',right:72,top:32,color:BLUE_GREY,fontSize:20}}>提问 / 解释 / 回答</div>
    {observation||mixed?<div style={{position:'absolute',left:mixed?72:530,top:mixed?550:570,fontSize:mixed?18:19,color:GREY}}>{topic==='solar'?'NASA / SDO · 观测资料经暖色调处理':'NASA / Goddard · 火山脱气过程动画'}</div>:null}
    <div style={{position:'absolute',left:72,right:72,top:637,height:53,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:44,fontWeight:700,color:WHITE,textShadow:`0 2px 5px ${BACKGROUND}`}}>{caption}</div>
    <div style={{position:'absolute',left:0,bottom:0,height:5,width:`${100*(f+1)/story.totalFrames}%`,background:GOLD}}/>
  </AbsoluteFill>;
};
