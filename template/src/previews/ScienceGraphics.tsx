import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {BACKGROUND, BLUE_GREY, GOLD, GOLD_LIGHT, MUTED as GREY, SURFACE, FOREGROUND as WHITE} from '../theme';

export type Topic = 'solar' | 'volcano';
const font = "'Noto Sans SC', sans-serif";
const clamp = (n: number) => Math.max(0,Math.min(1,n));
export const topicCopy = {
  solar: {title:'太阳为什么会爆发？', sub:'从活动区，看见能量释放', action:'磁场重组，释放能量', note:'NASA / SDO · 观测影像经暖色调处理', captions:['先看太阳的活动区域。','亮起来的地方，发生了什么？','磁场变化，让能量释放。','把观测和原理，放在一起看。']},
  volcano: {title:'火山也会“呼吸”吗？', sub:'从火山口，看见气体运动', action:'气体逸出，形成羽流', note:'NASA / Goddard · 火山脱气资料画面', captions:['火山也会释放气体。','看一看，气体往哪里运动。','沿着剖面，理解气体怎样逸出。','把现象和结构，放在一起看。']},
};

export const Heading: React.FC<{topic: Topic; phase?: 'intro'|'observe'}> = ({topic,phase='intro'}) => {
  const f=useCurrentFrame(), c=topicCopy[topic];
  const p=phase==='observe'?1:clamp(f/14);
  return <AbsoluteFill style={{fontFamily:font,pointerEvents:'none'}}>
    <div style={{position:'absolute',left:72,top:170,width:410,opacity:p,transform:`translateY(${26*(1-p)}px)`}}>
      <div style={{color:GOLD,fontSize:22,letterSpacing:4,marginBottom:20}}>{phase==='intro'?'从现象出发':'走近观察'}</div>
      <div style={{fontSize:62,fontWeight:900,lineHeight:1.25,color:WHITE}}>{topic==='volcano'?<>火山也会<br/>“呼吸”吗？</>:c.title}</div>
      <div style={{width:phase==='observe'?200:100+100*clamp((f-10)/30),height:3,background:GOLD,marginTop:28}} />
      <div style={{fontSize:25,color:BLUE_GREY,marginTop:24,lineHeight:1.6}}>{c.sub}</div>
    </div>
    <div style={{position:'absolute',left:570,top:580,color:GREY,fontSize:22}}>{c.note}</div>
  </AbsoluteFill>;
};

const Plot: React.FC<{topic:Topic;settled?:boolean}> = ({topic,settled=false}) => {
  const f=useCurrentFrame();
  const draw=settled?1:clamp((f-12)/46);
  const pts=Array.from({length:100},(_,i)=>{
    const x=i/99;
    const y=topic==='solar'?.12+.78*Math.exp(-Math.pow((x-.58)/.13,2)):.15+.65*(1-Math.exp(-x*3));
    return [48+x*430,246-y*160];
  });
  const index=Math.min(99,Math.round(draw*99));
  return <div style={{position:'absolute',left:680,top:180,width:520,height:340,background:SURFACE,border:'1px solid #354552',borderRadius:16,fontFamily:font,overflow:'hidden'}}>
    <div style={{position:'absolute',left:30,top:22,color:WHITE,fontSize:27,fontWeight:700}}>{topic==='solar'?'能量释放的过程':'气体逸出的过程'}</div>
    <svg width={520} height={285} style={{position:'absolute',top:40}}>
      {[0,1,2,3].map(i=><line key={i} x1={48} x2={478} y1={86+i*53} y2={86+i*53} stroke="#354552" />)}
      <line x1={48} x2={478} y1={246} y2={246} stroke={BLUE_GREY} />
      <polyline points={pts.slice(0,index+1).map(p=>p.join(',')).join(' ')} fill="none" stroke={GOLD} strokeWidth={5} strokeLinejoin="round" />
      <circle cx={pts[index][0]} cy={pts[index][1]} r={8} fill={GOLD_LIGHT} />
    </svg>
    <div style={{position:'absolute',left:30,bottom:18,color:GREY,fontSize:22}}>过程示意 · 不代表实测数据</div>
  </div>;
};

export const Mechanism: React.FC<{topic:Topic}> = ({topic}) => {
  const f=useCurrentFrame();
  const reveal=clamp(f/16);
  const spread=clamp((f-18)/42);
  return <AbsoluteFill style={{fontFamily:font}}>
    <div style={{position:'absolute',left:72,top:120,color:GOLD,fontSize:22,letterSpacing:4}}>走进原理</div>
    <div style={{position:'absolute',left:72,top:157,color:WHITE,fontSize:44,fontWeight:900}}>{topicCopy[topic].action}</div>
    <svg width={600} height={370} style={{position:'absolute',left:42,top:225,opacity:reveal,transform:`translateX(${-40*(1-reveal)}px)`}}>
      {topic==='solar'?<>
        <ellipse cx={300} cy={300} rx={225} ry={64} fill="#3A3024" stroke={GOLD} strokeWidth={3} />
        {[0,1,2,3,4].map(i=><path key={i} d={`M ${155+i*19},292 C ${110+i*25-spread*20},${-40+i*25} ${485-i*25+spread*50},${-20+i*25} ${430-i*19},292`} fill="none" stroke={i===2?GOLD_LIGHT:BLUE_GREY} strokeWidth={i===2?5:2} opacity={.5+i*.1} />)}
        {Array.from({length:8},(_,i)=>{const t=((f+i*9)%65)/65;return <circle key={i} cx={210+210*t} cy={292-205*Math.sin(t*Math.PI)} r={i%3===0?8:5} fill={GOLD_LIGHT}/>;})}
      </>:<>
        <path d={`M 60,326 L 230,110 L 292,140 L 350,110 L 550,326 Z`} fill="#253442" stroke={BLUE_GREY} strokeWidth={3}/>
        <path d="M 230,110 Q 290,160 350,110" fill="none" stroke={GOLD} strokeWidth={6}/>
        <path d="M 290,322 Q 268,210 290,142" fill="none" stroke={GOLD} strokeWidth={9}/>
        {Array.from({length:12},(_,i)=>{const t=((f+i*8)%85)/85;return <circle key={i} cx={290+Math.sin(t*4+i)*t*62+spread*t*65} cy={150-125*t} r={5+t*12} fill={i%2?GOLD_LIGHT:BLUE_GREY} opacity={.8*(1-t)}/>;})}
        <ellipse cx={290} cy={321} rx={65+20*spread} ry={18} fill={GOLD} opacity={.7}/>
      </>}
    </svg>
    <Plot topic={topic}/>
  </AbsoluteFill>;
};

export const Synthesis: React.FC<{topic:Topic}> = ({topic}) => {
  const f=useCurrentFrame();
  const move=clamp(f/20);
  const link=clamp((f-22)/22);
  // Bridge both panels in the annotation layer so neither viewport clips the arrow.
  const arrowStart=454, arrowEnd=680, arrowY=356;
  const arrowTip=arrowStart+(arrowEnd-arrowStart)*link;
  return <AbsoluteFill style={{fontFamily:font}}>
    <div style={{position:'absolute',left:72,top:120,color:GOLD,fontSize:22,letterSpacing:4}}>走进原理</div>
    <div style={{position:'absolute',left:72,top:157,color:WHITE,fontSize:44,fontWeight:900}}>{topicCopy[topic].action}</div>
    <div style={{position:'absolute',left:122,top:310,width:90+240*move,height:120,border:`2px solid ${GOLD_LIGHT}`,borderRadius:12,opacity:.7}}/>
    <Plot topic={topic} settled/>
    {link>0?<svg width={1280} height={720} viewBox="0 0 1280 720" aria-hidden="true" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
      <path d={`M ${arrowStart},${arrowY} H ${arrowTip}`} fill="none" stroke={BACKGROUND} strokeWidth={8} strokeLinecap="round" opacity={.85}/>
      <path d={`M ${arrowStart},${arrowY} H ${arrowTip}`} fill="none" stroke={GOLD_LIGHT} strokeWidth={3} strokeLinecap="round"/>
      <path d={`M ${arrowTip-12},${arrowY-7} L ${arrowTip},${arrowY} L ${arrowTip-12},${arrowY+7}`} fill="none" stroke={BACKGROUND} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round"/>
      <path d={`M ${arrowTip-12},${arrowY-7} L ${arrowTip},${arrowY} L ${arrowTip-12},${arrowY+7}`} fill="none" stroke={GOLD_LIGHT} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={arrowStart} cy={arrowY} r={4} fill={GOLD_LIGHT}/>
    </svg>:null}
  </AbsoluteFill>;
};

export const PreviewChrome: React.FC<{topic:Topic}> = ({topic}) => {
  const f=useCurrentFrame();
  const phase=f<72?0:f<168?1:f<264?2:3;
  return <AbsoluteFill style={{fontFamily:font,pointerEvents:'none'}}>
    <div style={{position:'absolute',left:72,top:32,color:GREY,fontSize:20,letterSpacing:3}}>{topic==='solar'?'太阳物理':'地球科学'}</div>
    <div style={{position:'absolute',right:72,top:32,color:BLUE_GREY,fontSize:20}}>观察 / 理解 / 解释</div>
    <div style={{position:'absolute',left:72,right:72,top:637,height:53,display:'flex',alignItems:'center',justifyContent:'center',textAlign:'center',fontSize:44,fontWeight:700,color:WHITE,textShadow:`0 2px 5px ${BACKGROUND}`}}>{topicCopy[topic].captions[phase]}</div>
    <div style={{position:'absolute',left:0,bottom:0,height:5,width:`${100*(f+1)/360}%`,background:GOLD}}/>
  </AbsoluteFill>;
};
