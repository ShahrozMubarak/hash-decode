import MotionLanding from '@/components/studio/MotionLanding';
import {getLinks} from '@/lib/cms';
import {concepts,listProjects,listFounders,studioCopy} from '@/lib/studio-data';
import {studioSchema,safeJson} from '@/lib/structured';
import {runtime} from '@/lib/abuse';
import {meta,origin} from '@/lib/meta';
import './motion.css';
export const revalidate=300;
export const metadata=meta('Custom Software & Web Security','Hash Decode builds custom software, web platforms and business tools. Explore working studio concepts, review our security approach and send a project brief.','/');
export default async function Home(){
 const [projects,founders,links,copy]=await Promise.all([listProjects(),listFounders(),getLinks(),studioCopy()]);
 return <>{origin&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(studioSchema(origin,runtime('SERVICE_AREA')))}}/>}<MotionLanding projects={projects.filter(p=>p.kind==='Studio concept'&&concepts.some(c=>c.slug===p.slug))} founders={founders} links={links} intro={copy.intro}/></>;
}
