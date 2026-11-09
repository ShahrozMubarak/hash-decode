import * as THREE from 'three';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {UnrealBloomPass} from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import {OutputPass} from 'three/examples/jsm/postprocessing/OutputPass.js';
import {cubeCells,sceneBudget} from './scene-settings';
import type {PosterModel} from '@/components/studio/ModelPoster';

export async function mountScene(canvas:HTMLCanvasElement,model:PosterModel,signal:AbortSignal,ready:()=>void,failed:()=>void){
 const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
 const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
 const initialDpr = isMobile ? 1.5 : Math.min(dpr, 2);
 renderer.setPixelRatio(initialDpr);
 renderer.setClearColor(navy,0);
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.1;
 renderer.outputColorSpace=THREE.SRGBColorSpace;

 const scene=new THREE.Scene(),object=new THREE.Group();

 // 7.2 Camera (FOV 32 desktop & mobile, position (0, 0.15, 5.6) / mobile responsive (0, 0.08, 4.9))
 // Intro dolly: FOV 40 to target over 1800ms ease-out
 const targetFov = 32;
 const camera=new THREE.PerspectiveCamera(prefersReducedMotion ? targetFov : 40, 1, 0.1, 50);
 camera.position.set(0, isMobile ? 0.08 : 0.15, isMobile ? 4.9 : 5.6);
 camera.lookAt(0, 0, 0);

 // 7.3 Environment (RoomEnvironment through PMREMGenerator, intensity 1.0)
 const pmrem=new THREE.PMREMGenerator(renderer);
 pmrem.compileEquirectangularShader();
 const roomEnv=new RoomEnvironment();
 const envTexture=pmrem.fromScene(roomEnv,0.04).texture;
 scene.environment=envTexture;
 scene.environmentIntensity=1.0;
 roomEnv.dispose();
 pmrem.dispose();

 // 7.4 Lights
 // Key (directional) #ffffff 2.2 at (3, 4, 5) - orbits +-8 degrees over 12s
 const keyLight=new THREE.DirectionalLight(0xffffff, 2.2);
 keyLight.position.set(3, 4, 5);
 scene.add(keyLight);
 const keyBaseAngle = Math.atan2(5, 3);
 const keyRadius = Math.hypot(3, 5);

 // Cool rim #dbe8ff 1.8 at (-4, 2, -3)
 const coolRim=new THREE.DirectionalLight(new THREE.Color('#dbe8ff'), 1.8);
 coolRim.position.set(-4, 2, -3);
 scene.add(coolRim);

 // Coral rim #FF5A3C 2.0 at (4, -1, -2)
 const coralRim=new THREE.DirectionalLight(new THREE.Color('#FF5A3C'), 2.0);
 coralRim.position.set(4, -1, -2);
 scene.add(coralRim);

 // Hemisphere fill sky #dfe6e6 / ground #7d8484 at 0.4
 const hemiLight=new THREE.HemisphereLight(new THREE.Color('#dfe6e6'), new THREE.Color('#7d8484'), 0.4);
 scene.add(hemiLight);

 scene.add(object);

 // Materials
 const azure=new THREE.Color('#1E40AF'),snow=new THREE.Color('#dfe6e6'),coral=new THREE.Color('#D93A2F');
 const surface=new THREE.MeshPhysicalMaterial({color:azure,metalness:.9,roughness:.12,clearcoat:1,transparent:false,envMapIntensity:1.2});
 const coreFallback=new THREE.MeshStandardMaterial({color:coral,emissive:coral,emissiveIntensity:1.5,roughness:.26});
 const metal=new THREE.MeshStandardMaterial({color:snow,metalness:.83,roughness:.27});

 // 7.5 Materials for Robot (Bright titanium ceramic chrome shell, glowing cyan eyes, clear visor)
 const chromeShellMat=new THREE.MeshPhysicalMaterial({
  color:new THREE.Color('#f8fafc'), // pure bright radiant ceramic / light chrome
  metalness:0.85,
  roughness:0.08,
  clearcoat:1.0,
  clearcoatRoughness:0.04,
  envMapIntensity:1.4
 });

 const visorGlassMat=(isMobile||lite)?new THREE.MeshStandardMaterial({
  color:new THREE.Color('#0b162c'),
  metalness:0.2,
  roughness:0.05,
  transparent:true,
  opacity:0.35,
  depthWrite:false
 }):new THREE.MeshPhysicalMaterial({
  color:new THREE.Color('#0b162c'),
  metalness:0.1,
  roughness:0.04,
  transmission:0.86,
  ior:1.42,
  transparent:true,
  opacity:0.42,
  depthWrite:false
 });

 const visorScreenMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#030712'),
  roughness:0.1,
  metalness:0.15
 });

 const grokEyeMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#00f0ff'),
  emissive:new THREE.Color('#00f0ff'),
  emissiveIntensity:3.8,
  roughness:0.06,
  metalness:0.05
 });

 const coreMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#FF5A3C'),
  emissive:new THREE.Color('#FF5A3C'),
  emissiveIntensity:1.6,
  roughness:0.15,
  metalness:0.1
 });

 const bezelMat=new THREE.MeshStandardMaterial({
  color:new THREE.Color('#0B1F3A'),
  metalness:0.9,
  roughness:0.2
 });

 let corePointLight:THREE.PointLight|undefined;
 let coralGlowSprite:THREE.Sprite|undefined;
 let contactShadowMesh:THREE.Mesh|undefined;
 let eyeLeft:THREE.Object3D|undefined;
 let eyeRight:THREE.Object3D|undefined;
 let baseLeftEyeX=-0.27,baseRightEyeX=0.27,baseEyeY=3.08,baseEyeZ=0.355;
 let blinkTimer=0,nextBlink=4.5,blinkProgress=0;
 let isHovered=false,happyAmount=0,happyTouchTimer:NodeJS.Timeout|undefined;

 // Contact shadow texture (22% black radial fade)
 const shadowCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;
 let shadowTexture:THREE.CanvasTexture|undefined;
 if(shadowCanvas){
  shadowCanvas.width=128;
  shadowCanvas.height=128;
  const sctx=shadowCanvas.getContext('2d');
  if(sctx){
   const grad=sctx.createRadialGradient(64,64,0,64,64,64);
   grad.addColorStop(0,'rgba(0,0,0,0.22)');
   grad.addColorStop(0.5,'rgba(0,0,0,0.08)');
   grad.addColorStop(1,'rgba(0,0,0,0)');
   sctx.fillStyle=grad;
   sctx.fillRect(0,0,128,128);
   shadowTexture=new THREE.CanvasTexture(shadowCanvas);
   const shadowGeo=new THREE.PlaneGeometry(1.6,1.6);
   const shadowMat=new THREE.MeshBasicMaterial({map:shadowTexture,transparent:true,depthWrite:false});
   contactShadowMesh=new THREE.Mesh(shadowGeo,shadowMat);
   contactShadowMesh.rotation.x=-Math.PI/2;
   contactShadowMesh.position.set(0,-1.55,0);
   scene.add(contactShadowMesh);
  }
 }

 // Post-processing Bloom setup (strength .55, radius .6, threshold .85)
 let composer:EffectComposer|undefined;
 let bloomPass:UnrealBloomPass|undefined;
 let useBloom=!isMobile&&!lite;

 if(useBloom){
  try{
   composer=new EffectComposer(renderer);
   composer.addPass(new RenderPass(scene,camera));
   bloomPass=new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth,window.innerHeight),
    0.55, // strength
    0.6,  // radius
    0.85  // threshold
   );
   composer.addPass(bloomPass);
   composer.addPass(new OutputPass());
  }catch(err){
   console.warn('Bloom initialization failed, falling back to direct render:',err);
   composer=undefined;
   useBloom=false;
  }
 }

 // Mobile blurred coral sprite fallback behind core
 if(isMobile||lite||!useBloom){
  const spriteCanvas=typeof document!=='undefined'?document.createElement('canvas'):null;
  if(spriteCanvas){
   spriteCanvas.width=64;
   spriteCanvas.height=64;
   const spCtx=spriteCanvas.getContext('2d');
   if(spCtx){
    const spGrad=spCtx.createRadialGradient(32,32,0,32,32,32);
    spGrad.addColorStop(0,'rgba(255,90,60,0.7)');
    spGrad.addColorStop(0.4,'rgba(255,90,60,0.25)');
    spGrad.addColorStop(1,'rgba(255,90,60,0)');
    spCtx.fillStyle=spGrad;
    spCtx.fillRect(0,0,64,64);
    const spTex=new THREE.CanvasTexture(spriteCanvas);
    const spMat=new THREE.SpriteMaterial({map:spTex,transparent:true,blending:THREE.AdditiveBlending});
    coralGlowSprite=new THREE.Sprite(spMat);
    coralGlowSprite.scale.set(0.75,0.75,1);
   }
  }
 }

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

 // Dynamic Quality Tracker: drop DPR to 1 and disable bloom if FPS < 40 for 2s
 let lowFpsDuration=0;
 let dynamicQualityTriggered=false;

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

   // Dynamic Quality check: if delta > 0.025s (FPS < 40) for 2s, scale back
   if(!dynamicQualityTriggered&&delta>0.025){
    lowFpsDuration+=delta;
    if(lowFpsDuration>2.0){
     dynamicQualityTriggered=true;
     renderer.setPixelRatio(1.0);
     if(composer){
      composer=undefined;
      useBloom=false;
     }
    }
   }else if(delta<=0.025){
    lowFpsDuration=Math.max(0,lowFpsDuration-delta*0.5);
   }

   // Rotate environment: 0 -> 2*PI over 120s so reflections drift across chrome
   if(scene.environmentRotation){
    scene.environmentRotation.y=(elapsed*(Math.PI*2/120))%(Math.PI*2);
   }

   // Key light orbit: +-8 degrees over 12s
   const orbitAngle=Math.sin(elapsed*(Math.PI*2/12))*(8*Math.PI/180);
   keyLight.position.set(
    keyRadius*Math.cos(keyBaseAngle+orbitAngle),
    4,
    keyRadius*Math.sin(keyBaseAngle+orbitAngle)
   );

   // Camera Intro Dolly: FOV 40 -> 32 (38 on mobile) over 1800ms ease-out
   if(!prefersReducedMotion&&elapsed<=1.8){
    const dollyT=Math.min(1,elapsed/1.8);
    const dollyEase=1-Math.pow(1-dollyT,3);
    camera.fov=40-(40-targetFov)*dollyEase;
    camera.updateProjectionMatrix();
   }

   // Happy emotion interpolation (0 -> 1 on hover)
   happyAmount+=((isHovered?1:0)-happyAmount)*0.12;
   const happyHeartbeat=Math.sin(elapsed*5.2)*0.8*happyAmount;

   // Core pulse: 2.4s period, emissive 1.2 to 2.2, point light 1.2 to 3.0 + happy heartbeat
   const corePulse=(Math.sin(elapsed*(Math.PI*2/2.4))+1)*0.5; // 0.0 to 1.0
   const scrollClamped=Math.min(1,Math.max(0,progress));
   const coreBrightnessBoost=scrollClamped*0.6; // Core brightens on scroll

   coreMat.emissiveIntensity=1.4+corePulse*1.0+coreBrightnessBoost+happyHeartbeat;
   if(corePointLight)corePointLight.intensity=1.5+corePulse*1.8+coreBrightnessBoost*1.2+happyHeartbeat*1.4;
   if(coralGlowSprite)coralGlowSprite.material.opacity=0.55+corePulse*0.35+happyAmount*0.2;

   // Glowing cyan eyes brighten excitedly when happy
   grokEyeMat.emissiveIntensity=3.6+happyAmount*2.0;

   // Eye Blink and Happy Arcs (^ ^)
   if(eyeLeft&&eyeRight){
    blinkTimer+=delta;
    if(blinkTimer>nextBlink){
     blinkProgress+=delta/0.12;
     if(blinkProgress>=1.0){
      blinkTimer=0;blinkProgress=0;nextBlink=4.0+Math.random()*2.0;
     }
    }
    const blinkScaleY=blinkProgress>0?Math.max(0.1,1.0-Math.sin(blinkProgress*Math.PI)*0.9):1.0;

    // Happy eye shaping: eyes curve into cute upward inverted arcs (^ ^)
    const happyArcSquish=1.0-happyAmount*0.50;
    eyeLeft.scale.y=blinkScaleY*happyArcSquish;
    eyeRight.scale.y=blinkScaleY*happyArcSquish;
    eyeLeft.scale.x=1.0+happyAmount*0.20;
    eyeRight.scale.x=1.0+happyAmount*0.20;

    // Cute outward tilt for happy expression (^ ^)
    eyeLeft.rotation.z=happyAmount*0.40;
    eyeRight.rotation.z=-happyAmount*0.40;

    // Subtle eye shift toward cursor + slight happy upward perk
    const cursorEyeX=(currentMouseYaw/MAX_MOUSE_YAW)*0.035;
    const cursorEyeY=(currentMousePitch/MAX_MOUSE_PITCH)*0.025;
    eyeLeft.position.x=baseLeftEyeX+cursorEyeX;
    eyeRight.position.x=baseRightEyeX+cursorEyeX;
    eyeLeft.position.y=baseEyeY+cursorEyeY+happyAmount*0.040;
    eyeRight.position.y=baseEyeY+cursorEyeY+happyAmount*0.040;
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
    if(prefersReducedMotion){
     // Static posed robot facing camera
     object.scale.setScalar(1.0);
     object.position.set(0,0,0);
     object.rotation.set(0,0,0);
    }else{
     // Intro drop-in starting at 700ms with soft overshoot (ease-out-back over 1200ms)
     let dropY=0;
     let introScale=1.0;
     if(elapsed<0.7){
      dropY=0.8;
      introScale=0.9;
     }else if(elapsed<1.9){
      const t=(elapsed-0.7)/1.2;
      const c1=1.3;
      const c3=c1+1;
      const easeBack=1+c3*Math.pow(t-1,3)+c1*Math.pow(t-1,2);
      dropY=(1-easeBack)*0.8;
      introScale=0.9+0.1*easeBack;
     }

     // Idle float: sin(t * 0.9) * 0.06 (~7s period)
     const floatY=Math.sin(elapsed*0.9)*0.06;

     // Idle yaw sway: sin(t * 0.35) * 0.2618 rad (max +-15 deg, ~18s period)
     const idleYaw=Math.sin(elapsed*0.35)*SWAY_MAX;

     // Scroll response (first 100vh): scale 1 -> 0.82, translateY -6vh, rotateY 0 -> +25 degrees
     const scrollScale=1.0-scrollClamped*0.18;
     const scrollY=-scrollClamped*0.35;
     const scrollYaw=scrollClamped*(25*Math.PI/180);

     // Clamp total yaw so visor is never edge-on (max +-28 degrees / 0.48 rad)
     const rawYaw=idleYaw+currentMouseYaw+scrollYaw+userDragRotY;
     const clampedYaw=Math.max(-0.48,Math.min(0.48,rawYaw));

     // Happy animation: gentle joyful bob, curious upward pitch tilt, cute head roll
     const happyBob=Math.sin(elapsed*4.2)*0.035*happyAmount;
     const happyPitch=-0.07*happyAmount; // looks up curiously toward the user
     const happyRoll=Math.sin(elapsed*2.6)*0.03*happyAmount; // playful head tilt

     object.scale.setScalar(introScale*scrollScale);
     object.position.set(0,dropY+floatY+scrollY+happyBob,0);
     object.rotation.x=currentMousePitch+userDragRotX+happyPitch;
     object.rotation.y=clampedYaw;
     object.rotation.z=happyRoll;

     // Contact shadow scales inversely with float height and shrinks on scroll
     if(contactShadowMesh){
      const shadowScale=(1-floatY*1.5)*(1-scrollClamped*0.25);
      contactShadowMesh.scale.set(shadowScale,shadowScale,1);
     }
    }
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

   try{
    if(composer&&useBloom){
     composer.render();
    }else{
     renderer.render(scene,camera);
    }
    ready();
   }catch{
    stop();suspended=true;failed();return;
   }
  }
  frame=requestAnimationFrame(frameLoop);
 }

 const start=()=>{if(!frame&&!disposed&&loaded&&visible&&!suspended&&!document.hidden)frame=requestAnimationFrame(frameLoop);};
 const visibility=()=>{if(document.hidden)stop();else start();};

 const resize=new ResizeObserver(()=>{
  const {width,height}=canvas.getBoundingClientRect();
  if(width&&height){
   renderer.setSize(Math.round(width),Math.round(height),false);
   if(composer&&bloomPass){
    composer.setSize(Math.round(width),Math.round(height));
   }
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

 const onPointerEnter=()=>{isHovered=true;};
 const onPointerLeave=()=>{isHovered=false;};
 const onTouchHappy=()=>{
  isHovered=true;
  if(happyTouchTimer)clearTimeout(happyTouchTimer);
  happyTouchTimer=setTimeout(()=>{isHovered=false;},3000);
 };

 const onPointerDown=(e:PointerEvent)=>{
  isDragging=true;dragStartX=e.clientX;dragStartY=e.clientY;
  onTouchHappy();
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

 const heroContainer = typeof canvas !== 'undefined' ? (canvas.closest('.hero-object') || canvas) : null;

 function dispose(){
  if(disposed)return;disposed=true;stop();resize.disconnect();view.disconnect();
  document.removeEventListener('visibilitychange',visibility);
  window.removeEventListener('hd:scroll',onScroll);
  window.removeEventListener('pointermove',onPointerMoveWindow);
  if(heroContainer){
   heroContainer.removeEventListener('pointerenter',onPointerEnter);
   heroContainer.removeEventListener('pointerleave',onPointerLeave);
  }
  canvas.removeEventListener('pointerenter',onPointerEnter);
  canvas.removeEventListener('pointerleave',onPointerLeave);
  canvas.removeEventListener('pointerdown',onPointerDown);
  canvas.removeEventListener('pointermove',onPointerMove);
  canvas.removeEventListener('pointerup',onPointerUp);
  canvas.removeEventListener('pointercancel',onPointerUp);
  canvas.removeEventListener('webglcontextlost',lost);
  canvas.removeEventListener('webglcontextrestored',restore);
  if(happyTouchTimer)clearTimeout(happyTouchTimer);
  cleanGeometry();
  instances?.dispose();
  mixer?.stopAllAction();mixer=undefined;
  surface.dispose();metal.dispose();coreFallback.dispose();
  chromeShellMat.dispose();visorGlassMat.dispose();visorScreenMat.dispose();grokEyeMat.dispose();coreMat.dispose();bezelMat.dispose();
  envTexture.dispose();
  shadowTexture?.dispose();
  composer=undefined;
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
  if(heroContainer){
   heroContainer.addEventListener('pointerenter',onPointerEnter);
   heroContainer.addEventListener('pointerleave',onPointerLeave);
  }
  canvas.addEventListener('pointerenter',onPointerEnter);
  canvas.addEventListener('pointerleave',onPointerLeave);
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
   if(eyeLeft){
    eyeLeft.renderOrder=99;
    baseLeftEyeX=eyeLeft.position.x;
    baseEyeY=eyeLeft.position.y;
    baseEyeZ=eyeLeft.position.z;
   }
   if(eyeRight){
    eyeRight.renderOrder=99;
    baseRightEyeX=eyeRight.position.x;
   }

   // Add pulsing Coral Chest Core reactor (approx 0.22 wide x 0.06 high rounded panel)
   const coreGroup=new THREE.Group();
   const bezel=new THREE.Mesh(new THREE.CylinderGeometry(0.24,0.24,0.06,32),bezelMat);
   bezel.rotation.x=Math.PI/2;
   coreGroup.add(bezel);

   const coreDisk=new THREE.Mesh(new THREE.CylinderGeometry(0.20,0.20,0.07,32),coreMat);
   coreDisk.rotation.x=Math.PI/2;
   coreGroup.add(coreDisk);

   corePointLight=new THREE.PointLight(new THREE.Color('#FF5A3C'),2.0,4);
   coreGroup.add(corePointLight);

   if(coralGlowSprite){
    coralGlowSprite.position.set(0,0,-0.02);
    coreGroup.add(coralGlowSprite);
   }

   coreGroup.position.set(0,2.05,0.88);
   robot.add(coreGroup);

   robot.traverse(child=>{
    if(child instanceof THREE.Mesh){
     if(child.name==='Eye_Left'||child.name==='Eye_Right'){
      child.material=grokEyeMat;
      child.renderOrder=99;
      return;
     }
     const mats=Array.isArray(child.material)?child.material:[child.material];
     mats.forEach(m=>{
      if(!m)return;
      if(m.name==='GrokEye'){
       child.material=grokEyeMat;
       child.renderOrder=99;
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
   // Robot scaled to hero height (scale 2.55 desktop / 2.95 mobile for prominent responsive sizing)
   const mobileScale = isMobile ? 2.95 : 2.55;
   const scale=(model==='fixer'?2.5:mobileScale)/Math.max(size.x,size.y,size.z);
   robot.scale.multiplyScalar(scale);
   robot.position.sub(centre.multiplyScalar(scale));
  }

  loaded=true;
  const {width,height}=canvas.getBoundingClientRect();
  if(width&&height){
   renderer.setSize(Math.round(width),Math.round(height),false);
   if(composer&&bloomPass){
    composer.setSize(Math.round(width),Math.round(height));
   }
   camera.aspect=width/height;
   camera.updateProjectionMatrix();
  }
  try{
   if(composer&&useBloom){
    composer.render();
   }else{
    renderer.render(scene,camera);
   }
   ready();
  }catch(e){}
  window.dispatchEvent(new Event('hd:measure'));start();
 }catch(error){dispose();if(!signal.aborted)throw error;}
}
