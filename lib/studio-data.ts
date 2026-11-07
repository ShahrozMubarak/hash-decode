import { getDb } from '@/db';
import { projects, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type Project=typeof projects.$inferSelect;
export const concepts: Project[] = [
  {slug:'orbit-console',tech:'React, TypeScript, SVG',result:'A working signal sandbox with adjustable amplitude, frequency and channel. Try it in your browser.',title:'Orbit Console',category:'Web application',summary:'A live signal console for watching systems change in real time.',challenge:'Operators need to see a change in behaviour without losing the history around it. A wall of separate charts makes those relationships hard to follow.',solution:'Orbit puts the signal, its recent range and the controls on one surface. The interactive study lets you change frequency and amplitude against a running trace.',url:'',image:'',art:'orbit',status:'published',position:10,kind:'Studio concept'},
  {slug:'relay-board',tech:'React, TypeScript, Web Crypto',result:'A working delivery board where visitors can create tasks and move them from queue to release.',title:'Relay Board',category:'Internal tool',summary:'A compact workflow board for moving a team’s work from brief to release.',challenge:'When work changes hands, its current state can disappear into chat. The interface needs to make the next action obvious to the person picking it up.',solution:'Relay gives each task one visible stage and one clear next step. Try the working prototype to add a task and pass it through the board.',url:'',image:'',art:'relay',status:'published',position:20,kind:'Studio concept'}
];
export const defaults={intro:'Custom software, web platforms and security reviews for teams building their next release.',about:'Hash Decode is a software design and engineering studio. We work across the interface, the data behind it and the tools a team needs to keep it running.'};
export async function listProjects(all=false){
  const rows=await getDb().select().from(projects);
  const map=new Map(concepts.map(p=>[p.slug,p]));
  rows.forEach(p=>map.set(p.slug,p));
  return [...map.values()].filter(p=>all?p.status!=='deleted':p.status==='published').sort((a,b)=>a.position-b.position||a.title.localeCompare(b.title));
}
export async function studioCopy(){
  const row=await getDb().select().from(settings).where(eq(settings.id,'public')).get();
  return row ? {...defaults,...JSON.parse(row.value)} as typeof defaults : defaults;
}
export const services=[
  {id:'products',n:'01',name:'Custom software',summary:'From the first interaction to a shipped product.',detail:'We map the core user journey, prototype the difficult decisions and build responsive interfaces that are easy to learn.',tags:['Discovery','Product design','Web apps']},
  {id:'platforms',n:'02',name:'Web development',summary:'Fast, accessible websites with a real content system.',detail:'We join a considered visual system to server-rendered pages, clear content models and publishing tools your team can operate.',tags:['Websites','CMS','Performance']},
  {id:'tools',n:'03',name:'Business systems',summary:'Internal tools built around the way your team works.',detail:'We turn repeated manual steps into workflows, dashboards and integrations, with permissions and auditability designed in from the start.',tags:['Internal tools','APIs','Automation']},
  {id:'security',n:'04',name:'Security audits',summary:'A practical review of the paths that put users and data at risk.',detail:'We agree on an authorized scope, review authentication, permissions, exposed inputs and deployment settings, then deliver reproducible findings, prioritized fixes and a retest plan.',tags:['Threat modelling','App security','Remediation']}
];
