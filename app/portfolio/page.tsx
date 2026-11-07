import {listProjects} from '@/lib/studio-data';
import {WorkCard} from '@/components/studio/Work';
import {meta} from '@/lib/meta';
export const dynamic='force-dynamic';
export const metadata=meta('Software Projects and Studio Concepts','Explore Hash Decode case studies and working studio concepts. See the brief, design decisions and interactive software behind each entry.','/portfolio');
export default async function Portfolio(){const projects=await listProjects();return <div className="wrap interior"><header className="page-intro"><p className="kicker"><span className="key-line"/>Portfolio</p><h1>Project index.</h1><p>Open a study to explore the brief, follow the build and try the software.</p></header><div className="work-grid">{projects.map((p,i)=><WorkCard key={p.slug} project={p} index={i}/>)}</div>{!projects.length&&<p>New work will appear here as it is published.</p>}</div>;}
