import {getLinks} from '@/lib/cms';
import ContactForm from '@/components/studio/ContactForm';
import {meta} from '@/lib/meta';
export const metadata=meta('Start a Software Project','Send a brief for a web platform, internal tool, custom application or security audit. Tell Hash Decode about your goals, budget and timing.','/contact');
type Query=Promise<{type?:string|string[];brief?:string|string[]}>;
export default async function Contact({searchParams}:{searchParams:Query}){
 const [q,links]=await Promise.all([searchParams,getLinks()]);
 return <div className="wrap interior contact-grid"><header className="page-intro"><p className="kicker"><span className="key-line"/>Contact</p><h1>Start a conversation.</h1><p>Tell us about the people using your software and the problem you want to solve.</p><div className="contact-links">{links.whatsapp&&<a className="text-link" href={'https://wa.me/'+links.whatsapp}>WhatsApp the studio ↗</a>}{links.booking&&<a className="text-link" href={links.booking}>Book a conversation ↗</a>}</div></header><ContactForm initial={typeof q.type==='string'?q.type:''} initialBrief={typeof q.brief==='string'?q.brief:''}/></div>;
}
