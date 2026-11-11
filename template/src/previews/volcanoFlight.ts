import {CatmullRomCurve3, Vector3} from 'three';

export const conduit = new CatmullRomCurve3([
  new Vector3(0, -3.1, .95), new Vector3(-.75, -1.3, .62),
  new Vector3(.55, .5, .08), new Vector3(-.15, 2.3, -.5), new Vector3(0, 3.9, -.95),
], false, 'catmullrom', .35);

const clamp = (n:number) => Math.max(0, Math.min(1, n));
const smooth = (n:number) => {const p=clamp(n);return p*p*(3-2*p);};
const blend = (a:Vector3,b:Vector3,p:number) => a.clone().lerp(b,p);
const outside = new Vector3(7, 4.8, 16);
const overviewTarget = new Vector3(0, .3, 0);

export const flightPose = (frame:number) => {
  const entry=conduit.getPointAt(.04);
  const entryTarget=conduit.getPointAt(.14);
  let position:Vector3, target:Vector3, fov:number;
  if(frame<28){
    const p=smooth(frame/28);
    position=blend(new Vector3(9,5.4,17.5),outside,p);target=overviewTarget.clone();fov=42;
  }else if(frame<58){
    const p=smooth((frame-28)/30);
    position=blend(outside,entry,p);target=blend(overviewTarget,entryTarget,p);fov=42+22*p;
  }else if(frame<146){
    const u=.04+.90*smooth((frame-58)/88);
    position=conduit.getPointAt(u);target=conduit.getPointAt(Math.min(1,u+.09));fov=64;
  }else if(frame<168){
    const p=smooth((frame-146)/22);
    position=blend(conduit.getPointAt(.94),new Vector3(0,5.5,-1.5),p);
    target=blend(conduit.getPointAt(1),new Vector3(2.2,2,1.5),p);fov=64;
  }else{
    const p=smooth((frame-168)/28);
    position=blend(new Vector3(0,5.5,-1.5),new Vector3(8.4,7,17),p);
    target=blend(new Vector3(2.2,2,1.5),new Vector3(0,1,0),p);fov=64-22*p;
  }
  return {position,target,fov,volume:.10+.90*smooth(frame/28),
    phase:frame<28?'剖面展开':frame<58?'进入内部':frame<146?'沿裂隙穿行':frame<168?'到达地表':'拉回整体'};
};

export const tracerPosition = (frame:number,offset=0) => {
  const travel=frame<58?Math.max(0,frame/58)*.12:.04+.90*smooth((frame-58)/88)+.16;
  const u=travel+offset;
  if(u<=1)return conduit.getPointAt(Math.max(0,u));
  return conduit.getPointAt(1).add(new Vector3((u-1)*.45,(u-1)*7,-(u-1)*2.7));
};
