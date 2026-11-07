import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {cubeCells,sceneBudget} from './scene-settings';
import type {PosterModel} from '@/components/studio/ModelPoster';

export async function mountScene(canvas:HTMLCanvasElement,model:PosterModel,signal:AbortSignal,ready:()=>void,failed:()=>void){
 const {lite,dpr,fps}=sceneBudget(innerWidth,navigator.hardwareConcurrency,(navigator as Navigator&{deviceMemory?:number}).deviceMemory||0,devicePixelRatio);
 const css=getComputedStyle(document.documentElement);
 const shade=(key:string)=>new THREE.Color(css.getPropertyValue(key).trim());
 const azure=shade('--azure'),snow=shade('--snow'),coral=shade('--coral'),navy=shade('--navy');
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:!lite,powerPreference:'low-power',preserveDrawingBuffer:false});
 renderer.setPixelRatio(dpr);
 renderer.setClearColor(navy,0);
 const scene=new THREE.Scene(),object=new THREE.Group();
 const camera=new THREE.PerspectiveCamera(30,1,.1,50);
 camera.position.set(0,model==='eva'?0.15:0,model==='cube'?7.2:4.2);
 const surface=new THREE.MeshPhysicalMaterial({color:azure,metalness:.22,roughness:.21,clearcoat:1,transparent:model!=='halo'&&model!=='eva',opacity:model==='cube'?.57:.81,depthWrite:model==='halo'||model==='eva',envMapIntensity:1.3});
 const core=new THREE.MeshStandardMaterial({color:coral,emissive:coral,emissiveIntensity:.38,roughness:.26});
 const metal=new THREE.MeshStandardMaterial({color:snow.clone().lerp(azure,.42),metalness:.83,roughness:.27});
 scene.add(object,new THREE.HemisphereLight(snow,azure,1.45));
 const key=new THREE.DirectionalLight(snow,2.4);key.position.set(-3,4,4);scene.add(key);
 if(model==='eva'||model!=='cube'){
  const blueRim=new THREE.DirectionalLight(new THREE.Color('#1e75ff'),4.8);blueRim.position.set(3,-1,-4);
  const blueFill=new THREE.PointLight(new THREE.Color('#0066ff'),3.8,14);blueFill.position.set(0,0,-2.5);
  const cyanEyeLight=new THREE.PointLight(new THREE.Color('#00f0ff'),2.2,6);cyanEyeLight.position.set(0,0.4,1.4);
  scene.add(blueRim,blueFill,cyanEyeLight);
 }
 const pixels=new Uint8Array(128*64*4);
 const pixel=new THREE.Color();
 for(let y=0;y<64;y++)for(let x=0;x<128;x++){
   const value=Math.max(0,1-y/66)*.38+(x>13&&x<35&&y>15&&y<42?.58:0)+(x>78&&x<91&&y<44?.65:0);
   pixel.copy(navy).lerp(snow,Math.min(1,value));const i=(y*128+x)*4;
   pixels.set([pixel.r*255,pixel.g*255,pixel.b*255,255],i);
 }
 const environment=new THREE.DataTexture(pixels,128,64);
 environment.mapping=THREE.EquirectangularReflectionMapping;environment.needsUpdate=true;scene.environment=environment;
 let frame=0,last=0,elapsed=0,pulse=-5,progress=0,targetProgress=0,visible=true,disposed=false,loaded=false,suspended=false,currentDist=4.6;
 let instances:THREE.InstancedMesh|undefined;
 let mixer:THREE.AnimationMixer|undefined;
 
 // Grok-bot Eye Tracking & Animation State
 let eyeLeft:THREE.Object3D|undefined;
 let eyeRight:THREE.Object3D|undefined;
 let baseLeftEyeX=-0.27,baseRightEyeX=0.27,baseEyeY=3.08,baseEyeZ=0.355;
 let blinkTimer=0,nextBlink=3.2,blinkProgress=0;
 let lookTimer=0,nextLook=2.0;
 const currentLook={x:0,y:0},targetLook={x:0,y:0};

 const transforms=new THREE.Object3D(),cells=cubeCells.filter(([x,y,z])=>x||y||z);
 let robotMeshGroup:THREE.Group|undefined;
 let cubeInstances:THREE.InstancedMesh|undefined;
 const CUBE_COUNT=64;
 const cubeOrigins:{x:number;y:number;z:number;vx:number;vy:number;vz:number;rx:number;ry:number}[]=[];
 const cleanGeometry=()=>{const geometries=new Set<THREE.BufferGeometry>();object.traverse(node=>{if(node instanceof THREE.Mesh)geometries.add(node.geometry);});geometries.forEach(g=>g.dispose());};
 const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};
 function frameLoop(now:number){
  frame=0;if(disposed||suspended||!loaded||!visible||document.hidden)return;
  if(!last||now-last>=1000/fps){
   const delta=last?Math.min((now-last)/1000,.1):0;elapsed+=delta;last=now;mixer?.update(delta);
   progress+=(targetProgress-progress)*.14;

   // Grok-bot Eye Animations (Blinking & Organic Saccades)
   if(eyeLeft&&eyeRight){
    blinkTimer+=delta;
    if(blinkTimer>nextBlink){
     blinkProgress+=delta*15;
     if(blinkProgress>=Math.PI){
      blinkTimer=0;blinkProgress=0;nextBlink=2.6+Math.random()*3.0;
     }
    }
    const blinkScaleY=blinkProgress>0?Math.max(0.04,Math.abs(Math.cos(blinkProgress))):1.0;

    lookTimer+=delta;
    if(lookTimer>nextLook){
     lookTimer=0;nextLook=1.8+Math.random()*2.5;
     const targets=[
      {x:0,y:0},
      {x:-0.05,y:0.02},
      {x:0.05,y:0.02},
      {x:0,y:0.04},
      {x:-0.04,y:-0.03},
      {x:0.04,y:-0.03}
     ];
     const chosen=targets[Math.floor(Math.random()*targets.length)];
     targetLook.x=chosen.x;targetLook.y=chosen.y;
    }
    currentLook.x+=(targetLook.x-currentLook.x)*0.14;
    currentLook.y+=(targetLook.y-currentLook.y)*0.14;

    eyeLeft.scale.y=blinkScaleY;
    eyeRight.scale.y=blinkScaleY;
    eyeLeft.position.x=baseLeftEyeX+currentLook.x;
    eyeRight.position.x=baseRightEyeX+currentLook.x;
    eyeLeft.position.y=baseEyeY+currentLook.y;
    eyeRight.position.y=baseEyeY+currentLook.y;
    eyeLeft.position.z=baseEyeZ;
    eyeRight.position.z=baseEyeZ;
   }

   if(model==='eva'||model!=='cube'){
    const floatY=Math.sin(elapsed*1.5)*.06;
    const floatX=Math.cos(elapsed*1.0)*.03;
    const floatZ=Math.sin(elapsed*0.8)*.02;
    object.position.set(floatX,floatY,floatZ);
    object.rotation.z=Math.sin(elapsed*1.2)*.025;
    object.rotation.x=Math.cos(elapsed*0.9)*.02;
    object.rotation.y=-.15+elapsed*(lite?.08:.14);
    const orbitAngle=progress*Math.PI*2;
    camera.position.x=Math.sin(orbitAngle)*currentDist;
    camera.position.z=Math.cos(orbitAngle)*currentDist;
    camera.position.y=0.06+Math.sin(progress*Math.PI)*0.2;
    camera.lookAt(0,floatY*.2,0);
   }else{
    object.rotation.y=-.55+elapsed*(lite?.12:.18)+progress*1.1;
    const angle=(progress-.5)*.32;
    camera.position.x=Math.sin(angle)*7.2;
    camera.position.z=Math.cos(angle)*7.2*(canvas.closest('.gallery-object')?1-Math.sin(progress*Math.PI)*.38:1);
    camera.position.y=(progress-.5)*(lite?.28:.65);camera.lookAt(0,0,0);
    object.rotation.x=.38+progress*.18;
    object.rotation.z=.025;
   }
   if(model==='fixer'&&cubeInstances&&robotMeshGroup){
    const pulseImpact=Math.max(0,1-(elapsed-pulse)/1.4);
    const scrollImpact=Math.sin(progress*Math.PI*1.5);
    const idlePulse=Math.pow(Math.max(0,Math.sin(elapsed*0.85)),12);
    const explode=Math.min(1,Math.max(0,pulseImpact*1.2+Math.abs(scrollImpact)*0.95+idlePulse*0.85));
    if(explode>0.015){
     robotMeshGroup.scale.setScalar(Math.max(0.001,1-explode*0.85));
     robotMeshGroup.visible=explode<0.95;
     cubeOrigins.forEach((c,i)=>{
      const dist=explode*2.8;
      transforms.position.set(
       c.x+c.vx*dist+Math.sin(elapsed*2.5+i)*explode*0.25,
       c.y+c.vy*dist+Math.cos(elapsed*2.5+i)*explode*0.25,
       c.z+c.vz*dist
      );
      transforms.rotation.set(
       c.rx+elapsed*(1.2+(i%3))*explode*3,
       c.ry+elapsed*(1.5+(i%2))*explode*3,
       0
      );
      const s=Math.max(0.001,explode*(0.85+Math.sin(i+elapsed*3)*0.15));
      transforms.scale.setScalar(s);
      transforms.updateMatrix();
      cubeInstances!.setMatrixAt(i,transforms.matrix);
     });
     cubeInstances.instanceMatrix.needsUpdate=true;
     cubeInstances.visible=true;
    }else{
     robotMeshGroup.scale.setScalar(1);
     robotMeshGroup.visible=true;
     cubeInstances.visible=false;
    }
   }
   if(instances){
    const scatter=Math.pow(1-Math.min(1,elapsed/.88),3);
    const nudge=Math.max(0,1-(elapsed-pulse)/.75);
    cells.forEach(([x,y,z],i)=>{
     const moved=i%7===0?Math.sin(nudge*Math.PI)*.2:0;
     transforms.position.set(x*.68+Math.sin(i*17)*scatter*2.4+x*moved,y*.68+Math.cos(i*11)*scatter*2.1+y*moved,z*.68+Math.sin(i*7)*scatter*1.8);
     transforms.rotation.set(scatter*i*.17,scatter*i*.12,0);transforms.updateMatrix();instances!.setMatrixAt(i,transforms.matrix);
    });
    instances.instanceMatrix.needsUpdate=true;
   }
   try{renderer.render(scene,camera);ready();}catch{stop();suspended=true;failed();return;}
  }
  frame=requestAnimationFrame(frameLoop);
 }
 const start=()=>{if(!frame&&!disposed&&loaded&&visible&&!suspended&&!document.hidden)frame=requestAnimationFrame(frameLoop);};
 const visibility=()=>{if(document.hidden)stop();else start();};
 const updateDist=(w:number,h:number)=>{if(model==='cube'){currentDist=7.2;return;}const asp=w>0&&h>0?w/h:1;const zoom=asp<1?Math.max(1,0.95/asp):1;currentDist=4.6*zoom;};
 const resize=new ResizeObserver(()=>{const {width,height}=canvas.getBoundingClientRect();if(width&&height){renderer.setSize(Math.round(width),Math.round(height),false);camera.aspect=width/height;camera.updateProjectionMatrix();updateDist(width,height);}});
 const view=new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;if(visible)start();else stop();});
 const interact=()=>{pulse=elapsed;};
 const onScroll=(e:Event)=>{const detail=(e as CustomEvent<{hero:number,gallery:number,crystal:number,page:number}>).detail;targetProgress=canvas.closest('.stationary-mobile-crystal')?(detail.hero||0):model==='cube'?detail.hero:(model==='fixer'||model==='eva')?(detail.hero||detail.gallery||detail.page||0):detail.gallery;};
 function lost(e:Event){e.preventDefault();suspended=true;stop();failed();}
 function restore(){suspended=false;start();}
 function dispose(){
  if(disposed)return;disposed=true;stop();resize.disconnect();view.disconnect();
  document.removeEventListener('visibilitychange',visibility);window.removeEventListener('hd:scroll',onScroll);
  canvas.removeEventListener('pointerenter',interact);canvas.removeEventListener('pointerdown',interact);canvas.removeEventListener('hd:recompute',interact);
  canvas.removeEventListener('webglcontextlost',lost);canvas.removeEventListener('webglcontextrestored',restore);
  cleanGeometry();instances?.dispose();cubeInstances?.dispose();cubeInstances=undefined;robotMeshGroup=undefined;mixer?.stopAllAction();mixer=undefined;surface.dispose();metal.dispose();core.dispose();environment.dispose();renderer.dispose();renderer.forceContextLoss();
  signal.removeEventListener('abort',dispose);
 }
 signal.addEventListener('abort',dispose,{once:true});
 try{
  if(signal.aborted){dispose();return;}
  resize.observe(canvas);view.observe(canvas);document.addEventListener('visibilitychange',visibility);window.addEventListener('hd:scroll',onScroll);
  canvas.addEventListener('pointerenter',interact);canvas.addEventListener('pointerdown',interact);canvas.addEventListener('hd:recompute',interact);
  canvas.addEventListener('webglcontextlost',lost);canvas.addEventListener('webglcontextrestored',restore);
  if(model==='cube'){
   const cell=new RoundedBoxGeometry(.63,.63,.63,lite?1:2,.065);
   instances=new THREE.InstancedMesh(cell,surface,26);instances.frustumCulled=false;
   object.add(instances,new THREE.Mesh(cell,core));
  }else{
   const deadline=typeof AbortSignal.any==="function"?AbortSignal.any([signal,AbortSignal.timeout(15000)]):signal;
   const modelUrl=model==='fixer'?'/models/fixer_robot.glb':'/models/eva_robot.glb';
   const fallbackUrl=model==='fixer'?'/models/fixer_robot.glb':'/models/eva.glb';
   const [reply,{GLTFLoader}]=await Promise.all([
    fetch(modelUrl,{signal:deadline}).then(r=>r.ok?r:fetch(fallbackUrl,{signal:deadline})),
    import('three/examples/jsm/loaders/GLTFLoader.js')
   ]);
   if(!reply.ok)throw Error(`${model} unavailable`);
   const gltf=await new GLTFLoader().parseAsync(await reply.arrayBuffer(),'');
   const robot=gltf.scene;
   if(gltf.animations&&gltf.animations.length>0){
    mixer=new THREE.AnimationMixer(robot);
    const action=mixer.clipAction(gltf.animations[0]);
    action.play();
   }

   // Identify Grok-bot Eye nodes
   eyeLeft=robot.getObjectByName('Eye_Left')||undefined;
   eyeRight=robot.getObjectByName('Eye_Right')||undefined;
   if(eyeLeft){baseLeftEyeX=eyeLeft.position.x;baseEyeY=eyeLeft.position.y;baseEyeZ=eyeLeft.position.z;}
   if(eyeRight){baseRightEyeX=eyeRight.position.x;}

   const grokEyeMat=new THREE.MeshStandardMaterial({
    color:new THREE.Color('#00f0ff'),
    emissive:new THREE.Color('#00f0ff'),
    emissiveIntensity:4.5,
    roughness:0.1,
    metalness:0.1
   });

   robot.traverse(child=>{
    if(child instanceof THREE.Mesh){
     if(child.name==='Eye_Left'||child.name==='Eye_Right'){
      child.material=grokEyeMat;
      return;
     }
     const mats=Array.isArray(child.material)?child.material:[child.material];
     mats.forEach(m=>{
      if(!m)return;
      if(m.name==='GrokEye'){
       child.material=grokEyeMat;
      }else if(m.name==='Putih'){
       m.color=new THREE.Color('#edf2fa');
       m.roughness=0.18;
       m.metalness=0.15;
      }else if(m.name==='Material.006'){
       // Visor screen - deep glossy black
       m.color=new THREE.Color('#040711');
       m.roughness=0.08;
       m.metalness=0.2;
      }else if(m.name==='Material.001'){
       // Visor glass cover
       m.color=new THREE.Color('#041028');
       m.roughness=0.06;
       m.metalness=0.1;
       m.transparent=true;
       m.opacity=0.52;
       m.depthWrite=false;
      }
     });
    }
   });
   if(disposed)return;
   if(model==='fixer'){
    robotMeshGroup=new THREE.Group();
    robotMeshGroup.add(robot);
    object.add(robotMeshGroup);
    const cubeGeom=new RoundedBoxGeometry(0.14,0.14,0.14,lite?1:2,0.02);
    cubeInstances=new THREE.InstancedMesh(cubeGeom,surface,CUBE_COUNT);
    cubeInstances.visible=false;
    object.add(cubeInstances);
    for(let i=0;i<CUBE_COUNT;i++){
     const u=(i%4)-1.5,v=(Math.floor(i/4)%4)-1.5,w=Math.floor(i/16)-1.5;
     const ox=u*0.28,oy=v*0.38,oz=w*0.28;
     const len=Math.hypot(ox,oy,oz)||1;
     cubeOrigins.push({
      x:ox,y:oy,z:oz,
      vx:(ox/len)*(1.1+Math.random()*0.9),
      vy:(oy/len)*(1.1+Math.random()*0.9),
      vz:(oz/len)*(1.1+Math.random()*0.9),
      rx:Math.random()*Math.PI,
      ry:Math.random()*Math.PI,
     });
    }
   }else{
    object.add(robot);
   }
   if(deadline.aborted)throw Error('Model timed out');
   const bounds=new THREE.Box3().setFromObject(robot),size=bounds.getSize(new THREE.Vector3()),centre=bounds.getCenter(new THREE.Vector3());
   const scale=(model==='fixer'?2.3:2.1)/Math.max(size.x,size.y,size.z);
   robot.scale.multiplyScalar(scale);
   robot.position.sub(centre.multiplyScalar(scale));
  }
  loaded=true;
  const {width,height}=canvas.getBoundingClientRect();
  if(width&&height){renderer.setSize(Math.round(width),Math.round(height),false);camera.aspect=width/height;camera.updateProjectionMatrix();updateDist(width,height);}
  try{renderer.render(scene,camera);ready();}catch(e){}
  window.dispatchEvent(new Event('hd:measure'));start();
 }catch(error){dispose();if(!signal.aborted)throw error;}
}
