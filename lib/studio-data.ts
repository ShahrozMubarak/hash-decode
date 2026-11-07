import { getDb } from '@/db';
import { projects, settings } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type Project=typeof projects.$inferSelect;
export const concepts: Project[] = [
  {slug:'orbit-console',tech:'React, TypeScript, Real-time Charts',result:'A live interactive dashboard that lets you monitor your app and server activity with instant updates.',title:'Orbit Console',category:'Web application',summary:'A clean live monitoring dashboard to watch your system work in real time.',challenge:'Teams need a fast, simple way to see live system performance without getting lost in complicated graphs.',solution:'Orbit combines live metrics, easy-to-read charts, and quick controls into one simple, beautiful dashboard.',url:'',image:'',art:'orbit',status:'published',position:10,kind:'Studio project'},
  {slug:'relay-board',tech:'React, TypeScript, Drag-and-Drop',result:'A streamlined team task board where you can create, assign, and finish tasks with zero confusion.',title:'Relay Board',category:'Internal tool',summary:'A simple team task board for organizing projects from idea to completion.',challenge:'Daily project tasks often get lost in long chat threads and messy spreadsheets.',solution:'Relay gives every task a clear status and next step so everyone on the team knows what to do.',url:'',image:'',art:'relay',status:'published',position:20,kind:'Studio project'}
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
