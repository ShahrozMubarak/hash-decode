import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {cubeCells,sceneBudget} from './scene-settings';
import type {PosterModel} from '@/components/studio/ModelPoster';

export async function mountScene(canvas:HTMLCanvasElement,model:PosterModel,signal:AbortSignal,ready:()=>void,failed:()=>void){
 const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
 const {lite,dpr,fps}=sceneBudget(innerWidth,navigator.hardwareConcurrency,(navigator as Navigator&{deviceMemory?:number}).deviceMemory||0,devicePixelRatio);
 const css=getComputedStyle(document.documentElement);
 const shade=(key:string)=>new THREE.Color(css.getPropertyValue(key).trim()||'#0B1F3A');
 const navy=shade('--ink');

 // 7.1 Renderer
 const renderer=new THREE.WebGLRenderer({
  canvas,
  alpha:true,
  antialias:!lite,
  powerPreference:'high-performance',
  preserveDrawingBuffer:false
 });
 renderer.setPixelRatio(Math.min(dpr, 2));
 renderer.setClearColor(navy,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.1;
 renderer.outputColorSpace=THREE.SRGBColorSpace;

 const scene=new THREE.Scene(),object=new THREE.Group();

 // 7.2 Camera (STATIC, FOV 32 desktop / 38 mobile, position (0, 0.15, 5.6) / (0, 0.15, 6.2))
 const camera=new THREE.PerspectiveCamera(isMobile ? 38 : 32, 1, 0.1, 50);
 camera.position.set(0, 0.15, isMobile ? 6.2 : 5.6);
 camera.lookAt(0, 0, 0);

 // 7.3 Environment (PMREMGenerator + RoomEnvironment, environmentIntensity 1.0)
 const pmrem=new THREE.PMREMGenerator(renderer);
 pmrem.compileEquirectangularShader();
 const roomEnv=new RoomEnvironment();
 const envTexture=pmrem.fromScene(roomEnv,0.04).texture;
 scene.environment=envTexture;
 scene.environmentIntensity=1.0;
 roomEnv.dispose();
 pmrem.dispose();

 // 7.4 Lights
 // Key (directional) #ffffff, intensity 2.2, at (3, 4, 5)
 const keyLight=new THREE.DirectionalLight(0xffffff, 2.2);
 keyLight.position.set(3, 4, 5);
 scene.add(keyLight);

 // Cool rim (directional) #dbe8ff, intensity 1.8, at (-4, 2, -3)
 const coolRim=new THREE.DirectionalLight(new THREE.Color('#dbe8ff'), 1.8);
 coolRim.position.set(-4, 2, -3);
 scene.add(coolRim);

 // Coral rim (directional) #FF5A3C, intensity 2.0, at (4, -1, -2)
 const coralRim=new THREE.DirectionalLight(new THREE.Color('#FF5A3C'), 2.0);
 coralRim.position.set(4, -1, -2);
 scene.add(coralRim);

 // Hemisphere fill, sky #dfe6e6, ground #7d8484, intensity 0.4
 const hemiLight=new THREE.HemisphereLight(new THREE.Color('#dfe6e6'), new THREE.Color('#7d8484'), 0.4);
 scene.add(hemiLight);

 scene.add(object);

 // Materials
 const azure=new THREE.Color('#1E40AF'),snow=new THREE.Color('#dfe6e6'),coral=new THREE.Color('#D93A2F');
 const surface=new THREE.MeshPhysicalMaterial({color:azure,metalness:.9,roughness:.12,clearcoat:1,transparent:false,envMapIntensity:1.2});
 const coreFallback=new THREE.MeshStandardMaterial({color:coral,emissive:coral,emissiveIntensity:1.5,roughness:.26});
 const metal=new THREE.MeshStandardMaterial({color:snow,metalness:.83,roughness:.27});

 // 7.5 Materials for Robot
 const chromeShellMat=new THREE.MeshPhysicalMaterial({
  color:new THREE.Color('#e6ebef'),
  metalness:0.9,
  roughness:0.12,
  clearcoat:1.0,
  clearcoatRoughness:0.08,
  envMapIntensity:1.2
 });

 const visorGlassMat=(isMobile||lite)?new THREE.MeshStandardMaterial({
  color:new THREE.Color('#0b1220'),
  metalness:0.95,
  roughness:0.1
 }):new THREE.MeshPhysicalMaterial({
  color:new THREE.Color('#0b1220'),
  metalness:0.1,
  roughness:0.05,
  transmission:0.9,
  ior:1.45,
  thickness:1.2,
  transparent:true,
  depthWrite:true
 });

 const visorScreenMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#040711'),
  roughness:0.08,
  metalness:0.2
 });

 const grokEyeMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#3de0d0'),
  emissive:new THREE.Color('#3de0d0'),
  emissiveIntensity:1.5,
  roughness:0.1,
  metalness:0.1
 });

 const coreMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#FF5A3C'),
  emissive:new THREE.Color('#FF5A3C'),
  emissiveIntensity:1.5,
  roughness:0.15,
  metalness:0.1
 });

 const bezelMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#0B1F3A'),
  metalness:0.9,
  roughness:0.2
 });

 let corePointLight:THREE.PointLight|undefined;
 let eyeLeft:THREE.Object3D|undefined;
 let eyeRight:THREE.Object3D|undefined;
 let baseLeftEyeX=-0.27,baseRightEyeX=0.27,baseEyeY=3.08,baseEyeZ=0.355;
 let blinkTimer=0,nextBlink=4.5,blinkProgress=0;

 let frame=0,last=0,elapsed=0,progress=0,targetProgress=0,visible=true,disposed=false,loaded=false,suspended=false;
 let instances:THREE.InstancedMesh|undefined;
 let mixer:THREE.AnimationMixer|undefined;
 const transforms=new THREE.Object3D(),cells=cubeCells.filter(([x,y,z])=>x||y||z);

 // Mouse look interaction bounds
 const MAX_MOUSE_YAW=0.2094; // +-12 degrees (in radians)
 const MAX_MOUSE_PITCH=0.1396; // +-8 degrees (in radians)
 const SWAY_MAX=0.2618; // +-15 degrees idle sway (in radians)
 const LERP_FACTOR=0.06;

 let mouseTargetYaw=0;
 let mouseTargetPitch=0;
 let currentMouseYaw=0;
 let currentMousePitch=0;
 let isDragging=false,dragStartX=0,dragStartY=0,userDragRotX=0,userDragRotY=0;

 const cleanGeometry=()=>{
  const geometries=new Set<THREE.BufferGeometry>();
  object.traverse(node=>{if(node instanceof THREE.Mesh)geometries.add(node.geometry);});
  geometries.forEach(g=>g.dispose());
 };
 const stop=()=>{cancelAnimationFrame(frame);frame=0;last=0;};

 function frameLoop(now:number){
  frame=0;if(disposed||suspended||!loaded||!visible||document.hidden)return;
  if(!last||now-last>=1000/fps){
   const delta=last?Math.min((now-last)/1000,.1):0;elapsed+=delta;last=now;mixer?.update(delta);
   progress+=(targetProgress-progress)*.14;

   // Core pulse: 2.4s period, emissive 1.2 to 2.2, point light 1.2 to 3.0
   const corePulse=(Math.sin(elapsed*(Math.PI*2/2.4))+1)*0.5; // 0.0 to 1.0
   coreMat.emissiveIntensity=1.2+corePulse*1.0;
   if(corePointLight)corePointLight.intensity=1.2+corePulse*1.8;

   // Eye Blink (every 4-6s, 120ms duration)
   if(eyeLeft&&eyeRight){
    blinkTimer+=delta;
    if(blinkTimer>nextBlink){
     blinkProgress+=delta/0.12;
     if(blinkProgress>=1.0){
      blinkTimer=0;blinkProgress=0;nextBlink=4.0+Math.random()*2.0;
     }
    }
    const blinkScaleY=blinkProgress>0?Math.max(0.1,1.0-Math.sin(blinkProgress*Math.PI)*0.9):1.0;
    eyeLeft.scale.y=blinkScaleY;
    eyeRight.scale.y=blinkScaleY;

    // Subtle eye shift toward cursor
    eyeLeft.position.x=baseLeftEyeX+(currentMouseYaw/MAX_MOUSE_YAW)*0.035;
    eyeRight.position.x=baseRightEyeX+(currentMouseYaw/MAX_MOUSE_YAW)*0.035;
    eyeLeft.position.y=baseEyeY+(currentMousePitch/MAX_MOUSE_PITCH)*0.025;
    eyeRight.position.y=baseEyeY+(currentMousePitch/MAX_MOUSE_PITCH)*0.025;
   }

   // Mobile touch look-around (when not on pointer)
   if(isMobile&&!isDragging){
    mouseTargetYaw=Math.sin(elapsed*(Math.PI*2/10))*(8*Math.PI/180);
    mouseTargetPitch=0;
   }

   // Mouse look lerp
   currentMouseYaw+=(mouseTargetYaw-currentMouseYaw)*LERP_FACTOR;
   currentMousePitch+=(mouseTargetPitch-currentMousePitch)*LERP_FACTOR;

   if(!isDragging){
    userDragRotX*=0.92;
    userDragRotY*=0.92;
   }

   if(model==='eva'||model==='fixer'){
    // Idle float: sin(t * 0.9) * 0.06 (~7s period)
    const floatY=Math.sin(elapsed*0.9)*0.06;

    // Idle yaw sway: sin(t * 0.35) * 0.2618 rad (max +-15 deg, ~18s period)
    const idleYaw=Math.sin(elapsed*0.35)*SWAY_MAX;

    // Scroll response (first 100vh): scale 1 to 0.8, translateY up 8%, yaw +0.6 rad
    const scrollClamped=Math.min(1,Math.max(0,progress));
    const scrollScale=1.0-scrollClamped*0.2;
    const scrollY=scrollClamped*0.08;
    const scrollYaw=scrollClamped*0.6;

    object.scale.setScalar(scrollScale);
    object.position.set(0,floatY+scrollY,0);
    object.rotation.x=currentMousePitch+userDragRotX;
    object.rotation.y=idleYaw+currentMouseYaw+scrollYaw+userDragRotY;
    object.rotation.z=0;
   }else if(model==='cube'){
    object.rotation.y=-.55+elapsed*(lite?.12:.18)+progress*1.1;
    object.rotation.x=.38+progress*.18;
    object.rotation.z=.025;
   }

   if(instances){
    const scatter=Math.pow(1-Math.min(1,elapsed/.88),3);
    cells.forEach(([x,y,z],i)=>{
     transforms.position.set(x*.68+Math.sin(i*17)*scatter*2.4,y*.68+Math.cos(i*11)*scatter*2.1,z*.68+Math.sin(i*7)*scatter*1.8);
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

 const resize=new ResizeObserver(()=>{
  const {width,height}=canvas.getBoundingClientRect();
  if(width&&height){
   renderer.setSize(Math.round(width),Math.round(height),false);
   camera.aspect=width/height;
   camera.updateProjectionMatrix();
  }
 });

 const view=new IntersectionObserver(entries=>{visible=!!entries[0]?.isIntersecting;if(visible)start();else stop();});

 const onPointerMoveWindow=(e:PointerEvent)=>{
  if(isMobile)return;
  const nx=(e.clientX/(window.innerWidth||1))*2-1;
  const ny=(e.clientY/(window.innerHeight||1))*2-1;
  mouseTargetYaw=Math.max(-MAX_MOUSE_YAW,Math.min(MAX_MOUSE_YAW,nx*MAX_MOUSE_YAW));
  mouseTargetPitch=Math.max(-MAX_MOUSE_PITCH,Math.min(MAX_MOUSE_PITCH,-ny*MAX_MOUSE_PITCH));
 };

 const onPointerDown=(e:PointerEvent)=>{
  isDragging=true;dragStartX=e.clientX;dragStartY=e.clientY;
 };
 const onPointerMove=(e:PointerEvent)=>{
  if(!isDragging)return;
  const dx=e.clientX-dragStartX,dy=e.clientY-dragStartY;
  dragStartX=e.clientX;dragStartY=e.clientY;
  userDragRotY+=dx*0.007;userDragRotX+=dy*0.007;
 };
 const onPointerUp=()=>{isDragging=false;};

 const onScroll=(e:Event)=>{
  const detail=(e as CustomEvent<{hero:number,gallery:number,crystal:number,page:number}>).detail;
  targetProgress=detail.hero||detail.page||0;
 };

 function lost(e:Event){e.preventDefault();suspended=true;stop();failed();}
 function restore(){suspended=false;start();}

 function dispose(){
  if(disposed)return;disposed=true;stop();resize.disconnect();view.disconnect();
  document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('hd:scroll',onScroll);
  window.removeEventListener('pointermove',onPointerMoveWindow);
  canvas.removeEventListener('pointerdown',onPointerDown);
  canvas.removeEventListener('pointermove',onPointerMove);
  canvas.removeEventListener('pointerup',onPointerUp);
  canvas.removeEventListener('pointercancel',onPointerUp);
  canvas.removeEventListener('webglcontextlost',lost);
  canvas.removeEventListener('webglcontextrestored',restore);
  cleanGeometry();
  instances?.dispose();
  mixer?.stopAllAction();mixer=undefined;
  surface.dispose();metal.dispose();coreFallback.dispose();
  chromeShellMat.dispose();visorGlassMat.dispose();visorScreenMat.dispose();grokEyeMat.dispose();coreMat.dispose();bezelMat.dispose();
  envTexture.dispose();
  renderer.dispose();renderer.forceContextLoss();
  signal.removeEventListener('abort',dispose);
 }

 signal.addEventListener('abort',dispose,{once:true});

 try{
  if(signal.aborted){dispose();return;}
  resize.observe(canvas);
  view.observe(canvas);
  document.addEventListener('visibilitychange',visibility);
  window.addEventListener('hd:scroll',onScroll);
  window.addEventListener('pointermove',onPointerMoveWindow,{passive:true});
  canvas.addEventListener('pointerdown',onPointerDown);
  canvas.addEventListener('pointermove',onPointerMove);
  canvas.addEventListener('pointerup',onPointerUp);
  canvas.addEventListener('pointercancel',onPointerUp);
  canvas.addEventListener('webglcontextlost',lost);
  canvas.addEventListener('webglcontextrestored',restore);

  if(model==='cube'){
   const cell=new RoundedBoxGeometry(.63,.63,.63,lite?1:2,.065);
   instances=new THREE.InstancedMesh(cell,surface,26);instances.frustumCulled=false;
   object.add(instances,new THREE.Mesh(cell,coreFallback));
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

   eyeLeft=robot.getObjectByName('Eye_Left')||undefined;
   eyeRight=robot.getObjectByName('Eye_Right')||undefined;
   if(eyeLeft){baseLeftEyeX=eyeLeft.position.x;baseEyeY=eyeLeft.position.y;baseEyeZ=eyeLeft.position.z;}
   if(eyeRight){baseRightEyeX=eyeRight.position.x;}

   // Add pulsing Coral Chest Core reactor
   const coreGroup=new THREE.Group();
   const bezel=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.04,32),bezelMat);
   bezel.rotation.x=Math.PI/2;
   coreGroup.add(bezel);

   const coreDisk=new THREE.Mesh(new THREE.CylinderGeometry(0.18,0.18,0.05,32),coreMat);
   coreDisk.rotation.x=Math.PI/2;
   coreGroup.add(coreDisk);

   corePointLight=new THREE.PointLight(new THREE.Color('#FF5A3C'),2.0,4);
   coreGroup.add(corePointLight);

   coreGroup.position.set(0,2.05,0.88);
   robot.add(coreGroup);

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
       child.material=chromeShellMat;
      }else if(m.name==='Material.006'){
       child.material=visorScreenMat;
      }else if(m.name==='Material.001'){
       child.material=visorGlassMat;
      }
     });
    }
   });

   if(disposed)return;
   object.add(robot);
   if(deadline.aborted)throw Error('Model timed out');
   const bounds=new THREE.Box3().setFromObject(robot),size=bounds.getSize(new THREE.Vector3()),centre=bounds.getCenter(new THREE.Vector3());
   const scale=(model==='fixer'?2.3:2.1)/Math.max(size.x,size.y,size.z);
   robot.scale.multiplyScalar(scale);
   robot.position.sub(centre.multiplyScalar(scale));
  }

  loaded=true;
  const {width,height}=canvas.getBoundingClientRect();
  if(width&&height){
   renderer.setSize(Math.round(width),Math.round(height),false);
   camera.aspect=width/height;
   camera.updateProjectionMatrix();
  }
  try{renderer.render(scene,camera);ready();}catch(e){}
  window.dispatchEvent(new Event('hd:measure'));start();
 }catch(error){dispose();if(!signal.aborted)throw error;}
}
