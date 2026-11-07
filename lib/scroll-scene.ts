import {clampUnit} from './journey';
export const ease=(value:number)=>{const t=clampUnit(value);return t*t*(3-2*t);};
export type Pose={at:number,x:number,y:number,size:number,phase:number,yaw:number,pitch:number,distance:number,alpha:number};
export function poseAt(position:number,stops:Pose[]):Pose{
 if(!stops.length)throw Error('A scene needs a stop');
 let i=0;while(i<stops.length-2&&position>stops[i+1].at)i++;
 const a=stops[i],b=stops[Math.min(i+1,stops.length-1)];
 const t=ease((position-a.at)/Math.max(1,b.at-a.at));
 const result={...a};for(const key of ['x','y','size','phase','yaw','pitch','distance','alpha'] as const)result[key]=a[key]+(b[key]-a[key])*t;
 return result;
}

export function dottedMotion(seconds:number,scrollPhase:number,burstAge=10){
 const cycle=Math.max(0,seconds)/6.8,step=Math.floor(cycle);
 const transition=ease(((cycle-step)*6.8-5.2)/1.6);
 const burst=burstAge>=0&&burstAge<1.15?Math.sin(burstAge/1.15*Math.PI):0;
 return {phase:((step+transition+scrollPhase)%4+4)%4,scatter:Math.sin(transition*Math.PI)*1.25+Math.max(0,burst)*.9};
}
