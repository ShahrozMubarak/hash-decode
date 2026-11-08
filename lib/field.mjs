// Normalized, deterministic targets. The hash shares its geometry with the SVG first paint.
export const specimens = [
  { id: 'hash', name: 'Hash', label: 'Brand signature' },
  { id: 'decode', name: 'Decode', label: 'Character assembly' },
  { id: 'lock', name: 'Lock', label: 'Scroll to unlock' },
  { id: 'print', name: 'Print', label: 'Digital fingerprint' },
  { id: 'chain', name: 'Chain', label: 'Linked blocks' },
];

const TAU = Math.PI * 2;
const point = (x,y,z=0,tone=.65,group=0) => ({ x, y, z, tone, group });
const frac = n => n - Math.floor(n);
export const noise = n => frac(Math.sin(n * 12.9898 + 4.1414) * 43758.5453);

function hashGeometry() {
  const face = [], bevel = [], step = .042;
  const inside = (x,y) => Math.abs(y) < .95 && Math.abs(x) < 1.1 &&
    (Math.abs(Math.abs(x + .19*y) - .36) < .112 ||
      (Math.abs(Math.abs(y) - .32) < .11 && Math.abs(x+.12*y) < .94));
  for (let iy=-25; iy<=25; iy++) {
    for (let ix=-27; ix<=27; ix++) {
      const x=ix*step, y=iy*step;
      if (!inside(x,y)) continue;
      face.push(point(x,y,.13,.67 + .23*(1-y)/2));
      if ([[-1,0],[1,0],[0,1],[0,-1]].some(([dx,dy])=>!inside(x+dx*step,y+dy*step))) {
        for(let k=1;k<=6;k++) bevel.push(point(x,y,.13-.046*k,.17+.047*(6-k)));
      }
    }
  }
  return [...face,...bevel];
}

// No font download or canvas text readback is needed to form the brand name.
const alphabet = {
  H:['10001','10001','10001','11111','10001','10001','10001'],
  A:['01110','10001','10001','11111','10001','10001','10001'],
  S:['01111','10000','10000','01110','00001','00001','11110'],
  D:['11110','10001','10001','10001','10001','10001','11110'],
  E:['11111','10000','10000','11110','10000','10000','11111'],
  C:['01111','10000','10000','10000','10000','10000','01111'],
  O:['01110','10001','10001','10001','10001','10001','01110'],
};
function textGeometry(){
  const out=[];
  ['HASH','DECODE'].forEach((word,line)=>{
    const cell=.068, left=-(word.length*6-1)*cell/2;
    [...word].forEach((ch,index)=>alphabet[ch].forEach((row,y)=>[...row].forEach((bit,x)=>{
      if (bit!=='1') return;
      for(let i=0;i<3;i++) for(let j=0;j<3;j++){
        out.push(point(left+(index*6+x+(i+.5)/3)*cell,(y+(j+.5)/3)*cell+(line===0?-.58:.08),.018,.58+.27*(1-y/7)));
      }
    })));
  });
  return out;
}
function lockGeometry(){
  const out=[];
  for(let y=-.04;y<=.83;y+=.038)for(let x=-.68;x<=.68;x+=.038){
    if(Math.pow(Math.abs(x/.69),9)+Math.pow(Math.abs((y-.39)/.45),9)>1)continue;
    if(Math.hypot(x,y-.29)<.105 || (Math.abs(x)<.057&&y>.29&&y<.57)) continue;
    out.push(point(x,y,.12,.68+.17*(1-y)));
    if(Math.abs(x)>.60 || y>.77)out.push(point(x,y,-.10,.24));
  }
  const tube=(x,y,a)=>{for(let k=0;k<12;k++){const t=k/12*TAU;out.push(point(x+.085*Math.cos(t)*Math.cos(a),y+.085*Math.cos(t)*Math.sin(a),.08*Math.sin(t),.5+.35*Math.sin(t),1));}};
  for(let i=0;i<=55;i++){const a=Math.PI+i/55*Math.PI;tube(.43*Math.cos(a),-.49+.43*Math.sin(a),a);}
  for(let i=0;i<=16;i++){tube(-.43,-.49+i*.029,Math.PI);tube(.43,-.49+i*.029,0);}
  return out;
}

function fingerprintGeometry(){
  const out=[];
  for(let ridge=0;ridge<19;ridge++){
    const r=.07+ridge*.045, n=32+ridge*8;
    for(let j=0;j<n;j++){
      const a=j/n*TAU;
      if((a>1.0&&a<1.12&&ridge%4===2)||(a>4.3&&a<4.43&&ridge%6===1)) continue;
      const wobble=1+.048*Math.sin(3*a+ridge*.11)+.03*Math.cos(2*a);
      const x=(Math.cos(a)*r*.87-.08*(1-r)+.085*Math.sin(a)*r)*wobble;
      const y=(Math.sin(a)*r*1.15+.115*(1-r))*wobble;
      const z=.32*(1-r*r);
      out.push(point(x,y,z,.36+.45*(1-r)+.1*Math.cos(a)));
    }
  }
  return out;
}
function chainGeometry(){
  const out=[];
  [-1,0,1].forEach((index)=>{
    const ox=index*.75,oy=-index*.33, r=.30, a=-.57;
    const iso=(x,y,z)=>point(ox+x*Math.cos(a)+z*Math.sin(a),oy+y*.92-(z*Math.cos(a)-x*Math.sin(a))*.39,z*.3,.58+.25*(z+r)/(2*r));
    for(const sign1 of [-1,1])for(const sign2 of [-1,1])for(let j=0;j<24;j++){
      const t=(j/23*2-1)*r;
      out.push(iso(t,sign1*r,sign2*r),iso(sign1*r,t,sign2*r),iso(sign1*r,sign2*r,t));
    }
    for(let i=0;i<12;i++)for(let j=0;j<12;j++){
      const x=(i/11*2-1)*r,y=(j/11*2-1)*r;out.push(iso(x,y,r));
    }
    if(index!==1)for(let t=0;t<=1;t+=.025)out.push(point(ox+.31+.13*t,oy-.12-.10*t,.01,.23));
  });
  return out;
}

// Shuffle before sampling to avoid favoring one surface when mobile point budgets are lower.
function scatterOrder(verts,seed){
  const out=verts.slice();
  for(let i=out.length-1;i>0;i--){const j=Math.floor(noise(i+seed)*(i+1));[out[i],out[j]]=[out[j],out[i]];}
  return out;
}
export function makeTargets(count){
  if (!Number.isInteger(count)||count<1) throw Error('Point count must be a positive integer.');
  const sets={};
  [hashGeometry,textGeometry,lockGeometry,fingerprintGeometry,chainGeometry].forEach((create,j)=>{
    const raw=scatterOrder(create(),(j+1)*173);
    sets[specimens[j].id]=Array.from({length:count},(_,i)=>raw[Math.floor(i*raw.length/count)]);
  });
  sets.cloud=Array.from({length:count},(_,i)=>{
    const ang=noise(i*3+1)*TAU,z=noise(i*3+2)*2-1,r=.3+Math.cbrt(noise(i*3+3))*.97;
    return point(Math.cos(ang)*Math.sqrt(1-z*z)*r*1.15,Math.sin(ang)*Math.sqrt(1-z*z)*r,z*r,noise(i+902));
  });
  return sets;
}
export const pigments=['#050505','#121212','#1c1c1c','#2a2a2a','#fd614b','#ff705a','#ff8b77','#ffffff'];
export function projectPoint(x,y,z,rx,ry,rz){
  const ax=x*Math.cos(ry)+z*Math.sin(ry),az=z*Math.cos(ry)-x*Math.sin(ry);
  const ay=y*Math.cos(rx)-az*Math.sin(rx),depth=y*Math.sin(rx)+az*Math.cos(rx);
  const persp=4.8/(4.8-depth*.35);
  return {x:(ax*Math.cos(rz)-ay*Math.sin(rz))*persp,y:(ax*Math.sin(rz)+ay*Math.cos(rz))*persp,z:depth};
}
