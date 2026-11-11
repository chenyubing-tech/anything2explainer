import React, {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {useFrame, useThree} from '@react-three/fiber';
import {BackSide, Color, DoubleSide, Float32BufferAttribute, LatheGeometry, PerspectiveCamera, Quaternion, Shape, ShapeGeometry, TubeGeometry, Vector2, Vector3} from 'three';
import {BACKGROUND, BLUE_GREY, GOLD, GOLD_LIGHT, FOREGROUND} from '../theme';
import {conduit, flightPose, tracerPosition} from './volcanoFlight';

const fromZ = new Vector3(0,0,1);
const radiusAt=(y:number)=>6-(y+3.4)*.56;

const Camera:React.FC<{frame:number}> = ({frame}) => {
  const {camera}=useThree();
  useFrame(()=>{
    const pose=flightPose(frame);
    camera.position.copy(pose.position);camera.up.set(0,1,0);camera.lookAt(pose.target);
    const perspective=camera as PerspectiveCamera;
    perspective.fov=pose.fov;perspective.near=.045;perspective.far=120;perspective.updateProjectionMatrix();
  });
  return null;
};

const Geology:React.FC<{frame:number}> = ({frame}) => {
  // The cut faces explain the overview; fade them out before the camera enters the open conduit.
  const faceOpacity=frame<38?1:frame<58?Math.max(0,1-(frame-38)/20):frame<168?0:Math.min(1,(frame-168)/20);
  const bands=useMemo(()=>Array.from({length:7},(_,i)=>{
    const bottom=-3.4+i*1.04,top=bottom+1.04;
    const face=new Shape();face.moveTo(0,bottom);face.lineTo(radiusAt(bottom),bottom);face.lineTo(radiusAt(top),top);face.lineTo(0,top);face.closePath();
    return {surface:new LatheGeometry([new Vector2(radiusAt(bottom),bottom),new Vector2(radiusAt(top),top)],64,.68,Math.PI*2-1.36),face:new ShapeGeometry(face),color:i%2?'#394650':'#293945'};
  }),[]);
  return <group>
    {bands.map((band,i)=><group key={i}>
      <mesh geometry={band.surface}><meshStandardMaterial color={band.color} roughness={.9} side={DoubleSide}/></mesh>
      {[.68,Math.PI*2-.68].map(angle=><mesh key={angle} visible={faceOpacity>0} geometry={band.face} rotation={[0,angle-Math.PI/2,0]}>
        <meshStandardMaterial color={i%2?'#6C6250':'#464A46'} roughness={.95} side={DoubleSide} transparent opacity={faceOpacity} depthWrite={faceOpacity===1}/>
      </mesh>)}
    </group>)}
    <mesh position={[0,3.88,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[1.9,.10,8,64]}/><meshStandardMaterial color={GOLD} metalness={.5} roughness={.5}/>
    </mesh>
    <mesh position={[0,-3.55,0]} rotation={[-Math.PI/2,0,0]}>
      <circleGeometry args={[7.4,80]}/><meshStandardMaterial color="#17242E" roughness={.8}/>
    </mesh>
    {[6.8,7.3].map(r=><mesh key={r} position={[0,-3.53,0]} rotation={[Math.PI/2,0,0]}>
      <torusGeometry args={[r,.012,4,80]}/><meshBasicMaterial color={BLUE_GREY} transparent opacity={.3}/>
    </mesh>)}
  </group>;
};

const Tunnel:React.FC = () => {
  const geometry=useMemo(()=>{
    const tube=new TubeGeometry(conduit,112,.72,24,false);
    const uv=tube.getAttribute('uv'),colors:number[]=[];
    const base=new Color('#273746'),warm=new Color('#8C7046');
    for(let i=0;i<uv.count;i++){
      const u=uv.getX(i),v=uv.getY(i);
      const vein=Math.pow(Math.max(0,Math.sin(u*115+Math.sin(v*22)*2.4)),8);
      const c=base.clone().lerp(warm,.06+vein*.25);colors.push(c.r,c.g,c.b);
    }
    tube.setAttribute('color',new Float32BufferAttribute(colors,3));return tube;
  },[]);
  const rings=useMemo(()=>Array.from({length:23},(_,i)=>{
    const u=i/22;return {position:conduit.getPointAt(u),rotation:new Quaternion().setFromUnitVectors(fromZ,conduit.getTangentAt(u))};
  }),[]);
  return <group>
    <mesh geometry={geometry}><meshStandardMaterial vertexColors side={BackSide} roughness={.72} metalness={.25}/></mesh>
    <mesh geometry={geometry}><meshStandardMaterial color={GOLD} transparent opacity={.15} roughness={.6} depthWrite={false}/></mesh>
    {rings.map((r,i)=><mesh key={i} position={r.position} quaternion={r.rotation}>
      <torusGeometry args={[.708,.012,6,40]}/><meshStandardMaterial color={GOLD} emissive={GOLD} emissiveIntensity={.22} metalness={.4} roughness={.5}/>
    </mesh>)}
  </group>;
};

const Gas:React.FC<{frame:number}> = ({frame}) => {
  const leader=tracerPosition(frame);
  const viewer=flightPose(frame).position;
  return <group>
    <pointLight position={leader} color="#FFCB74" intensity={2} distance={4} decay={1.5}/>
    {Array.from({length:12},(_,i)=>{
      const p=tracerPosition(frame,i*.04);
      // Deterministic small offsets retain depth without detaching parcels from their conduit.
      p.x+=Math.sin(i*2.7)*.15;p.z+=Math.cos(i*1.9)*.13;
      if(p.distanceTo(viewer)<.8)return null;
      return <mesh key={i} position={p} scale={i===0?.09:.026+(i%3)*.008}>
        <sphereGeometry args={[1,16,12]}/><meshStandardMaterial color={GOLD_LIGHT} emissive={GOLD_LIGHT} emissiveIntensity={i===0?1.4:.7}/>
      </mesh>;
    })}
    <mesh position={[0,-3.12,.65]} scale={[1.7,.42,1.4]}>
      <sphereGeometry args={[1,32,16]}/><meshStandardMaterial color="#B88336" emissive="#E3AD56" emissiveIntensity={1.1} roughness={.45}/>
    </mesh>
    <pointLight position={[0,-2.7,.7]} color="#FFD180" intensity={9} distance={7} decay={1.7}/>
    {frame>142?Array.from({length:16},(_,i)=>{
      const t=((frame-142+i*6)%88)/88;
      const p=new Vector3(Math.sin(i*2)*(.2+t*.65),4.05+t*3,-.8-t*.7);
      if(p.distanceTo(viewer)<.9)return null;
      return <mesh key={i} position={p} scale={.05+t*.12}>
        <sphereGeometry args={[1,12,10]}/><meshStandardMaterial color={i%2?BLUE_GREY:GOLD_LIGHT} transparent opacity={.22*(1-t)} depthWrite={false}/>
      </mesh>;
    }):null}
  </group>;
};

const World:React.FC<{frame:number}> = ({frame}) => {
  const {volume}=flightPose(frame);
  return <>
    <Camera frame={frame}/>
    <color attach="background" args={[BACKGROUND]}/>
    <ambientLight intensity={1.3}/>
    <directionalLight position={[5,9,10]} intensity={3} color="#FFE3AA"/>
    <directionalLight position={[-6,3,-4]} intensity={2.2} color="#89AFC5"/>
    <group scale={[1,1,volume]}><Geology frame={frame}/><Tunnel/><Gas frame={frame}/></group>
  </>;
};

export const SpatialVolcanoMechanism:React.FC = () => {
  const frame=useCurrentFrame(),{width,height}=useVideoConfig();
  const phase=flightPose(frame).phase;
  return <AbsoluteFill style={{background:BACKGROUND}}>
    <ThreeCanvas width={width} height={height} dpr={1} camera={{fov:42,near:.045,far:120,position:[9,5.4,17.5]}} gl={{antialias:true,alpha:false,preserveDrawingBuffer:true}}>
      <World frame={frame}/>
    </ThreeCanvas>
    <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(16,24,33,.96),rgba(16,24,33,.86) 24%,transparent 42%,transparent 76%,rgba(16,24,33,.96))',pointerEvents:'none'}}/>
    <div style={{position:'absolute',left:72,top:108,fontFamily:"'Noto Sans SC', sans-serif",color:GOLD_LIGHT,fontSize:25,letterSpacing:3}}>{phase}</div>
    <div style={{position:'absolute',left:72,top:150,fontFamily:"'Noto Sans SC', sans-serif",color:FOREGROUND,fontSize:43,fontWeight:900}}>跟随气体，进入火山内部</div>
    <div style={{position:'absolute',left:72,top:585,fontFamily:"'Noto Sans SC', sans-serif",color:BLUE_GREY,fontSize:21}}>三维机制示意 · 结构与路径非按比例</div>
  </AbsoluteFill>;
};
