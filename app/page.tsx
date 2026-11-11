import MotionLanding from '@/components/studio/MotionLanding';
import {getLinks} from '@/lib/cms';
import {listProjects,listFounders,studioCopy} from '@/lib/studio-data';
import {studioSchema,safeJson} from '@/lib/structured';
import {runtime} from '@/lib/abuse';
import {meta,origin} from '@/lib/meta';
import './motion.css';
export const revalidate=300;
export const metadata=meta('Custom Software & Web Security','Custom software, web platforms and security reviews for teams building their next release.','/');
export default async function Home(){
 const [projects,founders,links,copy]=await Promise.all([listProjects(),listFounders(),getLinks(),studioCopy()]);
 return <>{origin&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:safeJson(studioSchema(origin,runtime('SERVICE_AREA')))}}/>}<MotionLanding projects={projects} founders={founders} links={links} intro={copy.intro} availability={copy.availability}/></>;
}
