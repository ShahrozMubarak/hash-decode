"use client";
import {useEffect,useState} from 'react';
import SceneSurface from './SceneSurface';
import ModelPoster from './ModelPoster';
import InlineDotted from './InlineDotted';
import DottedJourney from './DottedJourney';
function useMobile(){
 const [mobile,setMobile]=useState<boolean|null>(null);
 useEffect(()=>{const media=matchMedia('(max-width:850px)');const sync=()=>setMobile(media.matches);sync();media.addEventListener('change',sync);return()=>media.removeEventListener('change',sync);},[]);
 return mobile;
}
export function MobileCrystal(){
 const mobile=useMobile();
 return <div className="stationary-mobile-crystal">{mobile===true?<SceneSurface model="crystal" autoMobile/>:<ModelPoster model="crystal"/>}</div>;
}
export default function ResponsiveStage(){
 const mobile=useMobile(),[motion,setMotion]=useState(false);
 useEffect(()=>{const sync=()=>setMotion(document.documentElement.dataset.motion==='on'&&!matchMedia('(prefers-reduced-motion:reduce)').matches);sync();window.addEventListener('hd:motion',sync);return()=>window.removeEventListener('hd:motion',sync);},[]);
 return motion&&mobile===false?<DottedJourney/>:null;
}

export function MobileDotted(){const mobile=useMobile();return mobile===true?<InlineDotted form={3}/>:null;}
