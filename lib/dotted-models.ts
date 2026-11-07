/**
 * Deterministic 3D Dotted Particle Geometry + Physical Solid Models (the original studio)
 * Integrates:
 *   - 2 Solid Physical Models from the original studio:
 *       Model 1: Machined Titanium Halo Ring with 8-segmented blocks, radial grille, & core glow
 *       Model 2: Translucent Frosted Glass Superellipsoid Core Capsule with acoustic speaker grille & collar
 *   - 4 Procedural Dotted Particle Forms:
 *       Form 0: Extruded 3D '#' Hash with milled edges and shear
 *       Form 1: (2,3) Torus Knot / Trefoil continuous ribbon
 *       Form 2: Rippled Cyber Sphere with 12-theta and 7-phi harmonics
 *       Form 3: Fluted Torus ring
 */

export interface DottedData {
  forms: Float32Array[];
  seed: Float32Array;
}

export interface RenderState {
  x: number;
  y: number;
  size: number;
  phase: number;
  rotation: number;
  pitch?: number;
  distance?: number;
  explode: number;
  time: number;
  ambient: number;
  dark: number;
  alpha: number;
}

export interface PointerState {
  x: number;
  y: number;
  active: number;
}

const geometryCache = new Map<number, DottedData>();

export function geometry(count: number): DottedData {
  const cached = geometryCache.get(count);
  if (cached) return cached;

  const forms = Array.from({ length: 4 }, () => new Float32Array(count * 3));
  const seed = new Float32Array(count);
  const tau = Math.PI * 2;

  for (let i = 0; i < count; i++) {
    const u = (i * 0.61803398875) % 1;
    const v = (i * 0.75487766624) % 1;
    const q = (i * 0.56984029099) % 1;
    const j = i * 3;
    seed[i] = u;

    // Form 0: Extruded 3D '#' Hash Symbol
    const bar = i % 4;
    let x = 0, y = 0, z = 0;
    const face = Math.floor(q * 6);
    const a = u * 2 - 1, b = v * 2 - 1;
    const widths = bar < 2 ? [0.17, 0.88, 0.24] : [0.87, 0.17, 0.24];
    const pts = [a * widths[0], b * widths[1], (q * 2 - 1) * widths[2]];
    if (face < 2) {
      pts[0] = (face ? 1 : -1) * widths[0];
      pts[2] = b * widths[2];
      pts[1] = a * widths[1];
    } else if (face < 4) {
      pts[1] = (face === 3 ? 1 : -1) * widths[1];
      pts[2] = b * widths[2];
      pts[0] = a * widths[0];
    } else {
      pts[2] = (face === 5 ? 1 : -1) * widths[2];
    }
    x = pts[0] + (bar < 2 ? (bar === 0 ? -0.35 : 0.35) : 0);
    y = pts[1] + (bar >= 2 ? (bar === 2 ? -0.34 : 0.34) : 0);
    x += y * 0.12;
    z = pts[2];
    forms[0].set([x, y, z], j);

    // Form 1: Torus Knot / Trefoil Ribbon
    const t = u * tau, p = v * tau, rr = 0.17 + 0.035 * Math.cos(t * 3);
    const radius = 0.67 + 0.12 * Math.cos(3 * t);
    forms[1].set([
      (radius + rr * Math.cos(p)) * Math.cos(2 * t),
      (radius + rr * Math.cos(p)) * Math.sin(2 * t),
      0.28 * Math.sin(3 * t) + rr * Math.sin(p),
    ], j);

    // Form 2: Rippled Cyber Sphere with surface harmonics
    const theta = u * tau, phi = Math.acos(2 * v - 1);
    const rip = 1 + 0.055 * Math.sin(theta * 12 + phi * 7);
    forms[2].set([
      0.78 * Math.sin(phi) * Math.cos(theta) * rip,
      0.78 * Math.cos(phi) * rip,
      0.78 * Math.sin(phi) * Math.sin(theta) * rip,
    ], j);

    // Form 3: Fluted Torus ring
    const ct = u * tau, cp = v * tau, cr = 0.7 + 0.2 * Math.cos(cp);
    forms[3].set([
      cr * Math.cos(ct),
      cr * Math.sin(ct),
      0.2 * Math.sin(cp),
    ], j);
  }

  const result = { forms, seed };
  geometryCache.set(count, result);
  return result;
}

// ============================================================================
// SOLID MESH BUILDERS FROM the original studio (Model 1 Halo & Model 2 Core Capsule)
// ============================================================================

export interface MeshBuffer {
  p: Float32Array;
  n: Float32Array;
  uv: Float32Array;
  count: number;
}

function clamp(v: number, min: number, max: number) {
  return Math.min(max, Math.max(min, v));
}

function normalize3(a: number[]): number[] {
  const m = Math.hypot(...a) || 1;
  return a.map((v) => v / m);
}

export function buildMesh(
  sample: (u: number, v: number) => { p: number[]; n: number[] },
  nu: number,
  nv: number
): MeshBuffer {
  const p: number[] = [], n: number[] = [], uv: number[] = [];

  function vertex(i: number, j: number) {
    const a = sample(i / nu, j / nv);
    p.push(...a.p);
    n.push(...a.n);
    uv.push(i / nu, j / nv);
  }

  for (let i = 0; i < nu; i++) {
    for (let j = 0; j < nv; j++) {
      vertex(i, j);
      vertex(i + 1, j);
      vertex(i + 1, j + 1);
      vertex(i, j);
      vertex(i + 1, j + 1);
      vertex(i, j + 1);
    }
  }

  return {
    p: new Float32Array(p),
    n: new Float32Array(n),
    uv: new Float32Array(uv),
    count: p.length / 3,
  };
}

export function torusMesh(
  R: number,
  r: number,
  start = 0,
  end = Math.PI * 2,
  nu = 84,
  nv = 18,
  depth = 1
): MeshBuffer {
  const tau = Math.PI * 2;
  return buildMesh((u, v) => {
    const a = start + (end - start) * u;
    const b = v * tau;
    const c = Math.cos(b);
    const s = Math.sin(b);
    return {
      p: [(R + r * c) * Math.cos(a), (R + r * c) * Math.sin(a), r * s * depth],
      n: normalize3([c * Math.cos(a), c * Math.sin(a), s / depth]),
    };
  }, nu, nv);
}

export function aerumMeshes(): Record<string, MeshBuffer> {
  const tau = Math.PI * 2;

  // Sphere: used for acoustic central diaphragm and core speaker capsule
  const sphere = buildMesh((u, v) => {
    const a = u * tau, b = v * Math.PI;
    const p = [Math.sin(b) * Math.cos(a), Math.cos(b), Math.sin(b) * Math.sin(a)];
    return { p, n: p };
  }, 48, 32);

  // Superellipsoid Cube: used for Model 2 translucent frosted glass shell
  const cubeP: number[] = [], cubeN: number[] = [], cubeUV: number[] = [];
  let cubeCount = 0;

  for (let face = 0; face < 6; face++) {
    const axis = Math.floor(face / 2);
    const sign = face % 2 ? 1 : -1;
    const piece = buildMesh((u, v) => {
      const q = [0, 0, 0];
      q[axis] = sign;
      q[(axis + 1) % 3] = u * 2 - 1;
      q[(axis + 2) % 3] = v * 2 - 1;
      const c = q.map((x) => clamp(x, -0.72, 0.72));
      const norm = normalize3(q.map((x, i) => x - c[i]));
      return { p: c.map((x, i) => x + 0.28 * norm[i]), n: norm };
    }, 14, 14);

    cubeP.push(...Array.from(piece.p));
    cubeN.push(...Array.from(piece.n));
    cubeUV.push(...Array.from(piece.uv));
    cubeCount += piece.count;
  }

  const cube: MeshBuffer = {
    p: new Float32Array(cubeP),
    n: new Float32Array(cubeN),
    uv: new Float32Array(cubeUV),
    count: cubeCount,
  };

  return {
    sphere,
    cube,
    halo: torusMesh(0.78, 0.205),
    haloRim: torusMesh(0.642, 0.018),
    orbit: torusMesh(1.04, 0.009),
    segment: torusMesh(0.91, 0.145, -Math.PI / 8 + 0.028, Math.PI / 8 - 0.028, 14, 18, 1.45),
    segmentGlow: torusMesh(0.772, 0.025, -Math.PI / 8 + 0.035, Math.PI / 8 - 0.035, 14, 12),
    thinRing: torusMesh(0.72, 0.013),
  };
}

export function rotationMatrix(x: number, y: number, z: number): Float32Array {
  const cx = Math.cos(x), sx = Math.sin(x);
  const cy = Math.cos(y), sy = Math.sin(y);
  const cz = Math.cos(z), sz = Math.sin(z);
  return new Float32Array([
    cy * cz, cx * sz + sx * sy * cz, sx * sz - cx * sy * cz,
    -cy * sz, cx * cz - sx * sy * sz, sx * cz + cx * sy * sz,
    sy, -sx * cy, cx * cy,
  ]);
}

// ============================================================================
// SHADERS
// ============================================================================

export const SOLID_VERTEX_SHADER = `precision highp float;
attribute vec3 aPosition;
attribute vec3 aNormal;
attribute vec2 aUV;
uniform vec3 localScale;
uniform vec3 localMove;
uniform mat3 localRotation;
uniform mat3 rotation;
uniform vec2 center;
uniform vec2 resolution;
uniform float size;
varying vec3 normal;
varying vec3 point;
varying vec3 local;
varying vec2 uv;

void main(){
  local = aPosition;
  uv = aUV;
  vec3 p = rotation * (localRotation * (aPosition * localScale) + localMove);
  normal = normalize(rotation * localRotation * (aNormal / localScale));
  point = p;
  float perspective = 5.5 / max(.2, 5.5 - p.z);
  vec2 screen = center + vec2(p.x, -p.y) * size * perspective;
  gl_Position = vec4(screen.x / resolution.x * 2. - 1., 1. - screen.y / resolution.y * 2., -p.z / 40., 1.);
}`;

export const SOLID_FRAGMENT_SHADER = `precision highp float;
varying vec3 normal;
varying vec3 point;
varying vec3 local;
varying vec2 uv;
uniform vec3 color;
uniform float material;
uniform float alpha;
uniform float time;

float hash(vec3 p){
  return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453);
}

void main(){
  vec3 N = normalize(normal);
  vec3 V = normalize(vec3(0., 0., 5.5) - point);
  vec3 L = normalize(vec3(-.7, 1.2, 1.8));
  float ndv = abs(dot(N, V));
  float fres = pow(1. - ndv, 3.);
  vec3 R = reflect(-V, N);
  float strip = pow(max(0., 1. - abs(R.y - .42) * 2.4), 8.) * .8 + pow(max(0., 1. - abs(R.x + .58) * 5.), 16.) * .5;
  float diffuse = max(0., dot(N, L));
  float spec = pow(max(0., dot(reflect(-L, N), V)), 70.);
  float fine = hash(floor(local * 1200.)) - .5;
  vec3 c = color * (.43 + diffuse * .55 + N.y * .1) + vec3(strip * .46 + spec * .8) + vec3(.2, .6, .66) * fres * .22;
  c += fine * .018;
  float opacity = alpha;

  // Material 1: Matte alloy
  if(material > 0.5 && material < 1.5){
    c = color * (.68 + diffuse * .28) + vec3(spec * .6) + vec3(strip * .09);
  }
  // Material 2: Frosted etched glass with light refraction (Model 2 Core Capsule)
  if(material > 1.5 && material < 2.5){
    float etch = pow(max(0., sin(local.y * 80. + local.x * 5.)), 28.);
    c = mix(vec3(.60, .74, .79), vec3(.97, 1., 1.), clamp(fres + strip * .6 + spec, 0., 1.));
    c += etch * .06;
    opacity = alpha * (.10 + fres * .44 + strip * .08);
  }
  // Material 3: Core glow
  if(material > 2.5 && material < 3.5){
    c = color * 1.12 + vec3(.18);
    opacity = alpha;
  }
  // Material 4: Acoustic perforated speaker grille
  if(material > 3.5 && material < 4.5){
    vec2 grid = fract(local.xy * 26. + vec2(step(.5, fract(local.y * 13.)) * .5, 0.)) - .5;
    float hole = 1. - smoothstep(.17, .23, length(grid));
    float front = smoothstep(.05, .30, local.z);
    c = mix(c, vec3(.09, .13, .15), hole * front * .72);
    c += vec3(.04, .14, .16) * fres;
  }
  gl_FragColor = vec4(clamp(c, 0., 1.), opacity);
}`;

export const DOTTED_VERTEX_SHADER = `precision highp float;
attribute vec3 a0;
attribute vec3 a1;
attribute vec3 a2;
attribute vec3 a3;
attribute float seed;
uniform float phase;
uniform float time;
uniform float size;
uniform float ratio;
uniform float rotation;
uniform float pitch;
uniform float distance;
uniform float explode;
uniform float ambient;
uniform vec2 center;
uniform vec2 resolution;
uniform vec2 mouse;
uniform float mouseOn;
varying mediump float depth;
varying mediump float light;
varying mediump float fleck;
varying mediump float energy;

mat3 rotY(float a){return mat3(cos(a),0.,-sin(a),0.,1.,0.,sin(a),0.,cos(a));}
mat3 rotX(float a){return mat3(1.,0.,0.,0.,cos(a),sin(a),0.,-sin(a),cos(a));}

void main(){
  float f = fract(phase);
  f = f * f * (3. - 2. * f);
  vec3 p;
  if(phase < 1.) p = mix(a0, a1, f);
  else if(phase < 2.) p = mix(a1, a2, f);
  else if(phase < 3.) p = mix(a2, a3, f);
  else p = mix(a3, a0, clamp(phase - 3., 0., 1.));

  float s = sin(seed * 135.7);
  p += explode * .48 * vec3(s, cos(seed * 92.3), sin(seed * 49.));
  p += ambient * .012 * sin(time * .7 + seed * 22.) * normalize(p + vec3(.001));
  p = rotY(rotation) * rotX(pitch + sin(time * .11) * ambient * .08) * p;

  float cameraDepth = distance - p.z;
  if(cameraDepth < .08){gl_Position=vec4(2.,2.,2.,1.);gl_PointSize=0.;return;}
  float persp = 3.5 / cameraDepth;
  vec2 point = center + vec2(p.x, -p.y) * size * persp;
  vec2 diff = point - mouse;
  float dist = length(diff);
  // Tight, compact hover scatter area
  float force = (1. - smoothstep(0., 105., dist)) * mouseOn;
  point += normalize(diff + vec2(.1)) * force * (18. + seed * 36.);
  point += vec2(sin(seed * 48. + time), cos(seed * 79. + time)) * force * 2.5;
  energy = force;

  gl_Position = vec4((point.x / resolution.x * 2. - 1.), (1. - point.y / resolution.y * 2.), -p.z * .15, 1.);
  gl_PointSize = clamp((1.05 + seed * .9) * ratio * persp * (.8 + size / 380.) + force * ratio, 1., 8.);
  depth = clamp((p.z + 1.) * .5, 0., 1.);
  vec3 normal = normalize(p);
  light = pow(max(0., dot(normal, normalize(vec3(-.5, .7, 1.)))), 6.);
  fleck = seed;
}`;

export const DOTTED_FRAGMENT_SHADER = `precision mediump float;
varying mediump float depth;
varying mediump float light;
varying mediump float fleck;
varying mediump float energy;
uniform float dark;
uniform float alpha;
uniform vec3 azure;
uniform vec3 snow;
uniform vec3 coral;
uniform vec3 navy;
void main(){
 float d=length(gl_PointCoord-.5);if(d>.5)discard;
 float edge=1.-smoothstep(.28,.5,d);
 vec3 col=mix(navy,azure,.25+depth*.75);
 col=mix(col,snow,light*.65+dark*.18);
 col=mix(col,coral,step(.985,fleck)*.8);
 col=mix(col,azure,energy*.8);
 gl_FragColor=vec4(col,edge*(.65+depth*.35)*alpha);
}`;

export interface DottedRenderer {
  draw(state: RenderState, pointer?: PointerState): void;
  resize(width: number, height: number, dpr?: number): void;
  destroy(): void;
}

export function createDottedRenderer(canvas:HTMLCanvasElement,count=9000):DottedRenderer{
 const gl=canvas.getContext('webgl',{alpha:true,antialias:false,premultipliedAlpha:false,powerPreference:'low-power'});
 if(!gl)throw Error('WebGL unavailable');
 const shaders:WebGLShader[]=[],buffers:WebGLBuffer[]=[];
 const program=gl.createProgram();if(!program)throw Error('Renderer unavailable');
 const cleanup=()=>{buffers.forEach(b=>gl.deleteBuffer(b));shaders.forEach(s=>gl.deleteShader(s));gl.deleteProgram(program);};
 try{
  for(const [type,source] of [[gl.VERTEX_SHADER,DOTTED_VERTEX_SHADER],[gl.FRAGMENT_SHADER,DOTTED_FRAGMENT_SHADER]] as const){
   const shader=gl.createShader(type);if(!shader)throw Error('Shader unavailable');shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);
   if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw Error('Shader unavailable');gl.attachShader(program,shader);
  }
  gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Renderer unavailable');gl.useProgram(program);
  const data=geometry(count),attributes=[...data.forms,data.seed];
  attributes.forEach((array,i)=>{const b=gl.createBuffer();if(!b)throw Error('Buffer unavailable');buffers.push(b);gl.bindBuffer(gl.ARRAY_BUFFER,b);gl.bufferData(gl.ARRAY_BUFFER,array,gl.STATIC_DRAW);const loc=gl.getAttribLocation(program,i===4?'seed':'a'+i);if(loc>=0){gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,i===4?1:3,gl.FLOAT,false,0,0);}});
  const uniforms:Record<string,WebGLUniformLocation|null>={};
  for(const key of ['phase','time','size','ratio','rotation','pitch','distance','explode','ambient','center','resolution','mouse','mouseOn','dark','alpha','azure','snow','coral','navy'])uniforms[key]=gl.getUniformLocation(program,key);
  const css=getComputedStyle(document.documentElement);
  for(const key of ['azure','snow','coral','navy']){
   const hex=css.getPropertyValue('--'+key).trim().replace('#','');
   const color=Number.parseInt(hex,16);gl.uniform3f(uniforms[key],((color>>16)&255)/255,((color>>8)&255)/255,(color&255)/255);
  }
  gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);gl.disable(gl.DEPTH_TEST);
  let w=1,h=1,dpr=1;
  return {
   resize(width,height,ratio=Math.min(devicePixelRatio,1.75)){w=width;h=height;dpr=ratio;canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);gl.viewport(0,0,canvas.width,canvas.height);},
   draw(state,pointer){
    gl.clear(gl.COLOR_BUFFER_BIT);gl.useProgram(program);
    for(const key of ['phase','time','size','rotation','explode','ambient','dark','alpha'] as const)gl.uniform1f(uniforms[key],state[key]);
    gl.uniform1f(uniforms.pitch,state.pitch??-.22);gl.uniform1f(uniforms.distance,state.distance??3.5);gl.uniform1f(uniforms.ratio,dpr);
    gl.uniform2f(uniforms.center,state.x,state.y);gl.uniform2f(uniforms.resolution,w,h);gl.uniform2f(uniforms.mouse,pointer?.x??-1000,pointer?.y??-1000);gl.uniform1f(uniforms.mouseOn,pointer?.active??0);gl.drawArrays(gl.POINTS,0,count);
   },
   destroy:cleanup,
  };
 }catch(error){cleanup();throw error;}
}
