import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {cubeCells,sceneBudget} from '../lib/scene-settings.ts';
test('hash lattice has 26 distinct shell cells and one centre',()=>{
 assert.equal(cubeCells.length,27);assert.equal(new Set(cubeCells.map(String)).size,27);
 assert.equal(cubeCells.filter(v=>v.every(n=>n===0)).length,1);
});
test('scene budget caps fill rate across phone, low-memory and desktop hardware',()=>{
 assert.equal(sceneBudget(390,8,8,3).dpr,1.5);
 assert.equal(sceneBudget(1440,2,2,3).lite,true);
 assert.equal(sceneBudget(1440,8,8,3).dpr,1.75);
});
test('compact crystal has valid glTF geometry and retains its attribution',()=>{
 const file=readFileSync(new URL('../public/models/enchanted_crystal.glb',import.meta.url));
 assert.equal(file.subarray(0,4).toString(),'glTF');assert.equal(file.readUInt32LE(8),file.length);assert.ok(file.length<1500000);
 const data=JSON.parse(file.subarray(20,20+file.readUInt32LE(12)).toString());
 assert.ok(data.meshes.every(mesh=>mesh.primitives.every(p=>Number.isInteger(p.attributes.POSITION))));
 assert.match(JSON.stringify(data.asset),/TheTallOne/i);
});
import {journeyAt} from '../lib/journey.ts';
test('one scroll position drives section, rail and clamped object progress',()=>{
 const positions=[0,900,1800];
 assert.equal(journeyAt(-100,700,2600,positions,300,900,450).page,0);
 const middle=journeyAt(780,700,2600,positions,300,900,450);
 assert.equal(middle.current,1);assert.equal(middle.hero,1);assert.ok(middle.page>0&&middle.page<1);
 const end=journeyAt(2500,700,2600,positions,300,900,450);assert.equal(end.current,2);assert.equal(end.page,1);
});
import {studioSchema,safeJson} from '../lib/structured.ts';
import {faq,capabilities} from '../lib/landing-content.ts';
import {homeRequest} from '../worker/home-cache.ts';
test('structured data matches visible FAQ and services, and escapes HTML',()=>{
 const graph=studioSchema('https://studio.test','')['@graph'];
 assert.deepEqual(graph.find(x=>x['@type']==='FAQPage').mainEntity.map(x=>x.name),faq.map(([q])=>q));
 const service=graph.find(x=>x['@type']==='ProfessionalService');assert.equal(service.hasOfferCatalog.itemListElement.length,capabilities.length);assert.ok(!('areaServed' in service));
 assert.ok(!safeJson({text:'</script>'}).includes('<'));
});
test('the HTML cache excludes private, query and flight requests',()=>{
 const get=(path='/',headers={})=>new Request('https://studio.test'+path,{headers:{Accept:'text/html',...headers}});
 assert.equal(homeRequest(get()),true);
 for(const req of [get('/admin'),get('/?preview=1'),get('/',{cookie:'a=b'}),get('/',{RSC:'1'}),get('/',{authorization:'x'}),get('/',{Accept:'text/x-component'})])assert.ok(!homeRequest(req));
});
import {poseAt} from '../lib/scroll-scene.ts';
test('camera poses interpolate continuously and clamp at both ends',()=>{
 const a={at:0,x:80,y:200,size:160,phase:0,yaw:-.3,pitch:-.2,distance:4,alpha:1};
 const b={at:1000,x:500,y:100,size:70,phase:1,yaw:1,pitch:.4,distance:3,alpha:0};
 assert.deepEqual(poseAt(-100,[a,b]),a);
 const mid=poseAt(500,[a,b]);assert.equal(mid.x,290);assert.equal(mid.size,115);assert.equal(mid.alpha,.5);assert.equal(mid.phase,.5);
 assert.equal(poseAt(1500,[a,b]).x,b.x);assert.equal(poseAt(1500,[a,b]).alpha,0);
});
import {dottedMotion} from '../lib/scroll-scene.ts';
test('dotted motion holds, scatters into the next shape and closes its loop',()=>{
 assert.equal(dottedMotion(0,0).phase,0);
 assert.equal(dottedMotion(4,0).scatter,0);
 const transition=dottedMotion(6,0);assert.ok(transition.phase>0&&transition.phase<1);assert.ok(transition.scatter>1);
 assert.equal(dottedMotion(6.8,0).phase,1);assert.equal(dottedMotion(27.2,0).phase,0);
 assert.ok(dottedMotion(1,0,.575).scatter>.8);
 for(let t=0;t<60;t+=.1){const m=dottedMotion(t,3.9);assert.ok(m.phase>=0&&m.phase<4);assert.ok(m.scatter>=0&&m.scatter<2.2);}
});
