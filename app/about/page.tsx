import {Team} from '@/components/studio/Extras';
import {studioCopy} from '@/lib/studio-data';
import {meta} from '@/lib/meta';
export const dynamic='force-dynamic';
export const metadata=meta('About the Software Studio','Learn how Hash Decode approaches product design, full-stack development, security review and software handover.','/about');
export default async function About(){const copy=await studioCopy();return <div className="wrap interior"><header className="page-intro"><p className="kicker"><span className="key-line"/>About Hash Decode</p><h1>Inside the studio.</h1><p>{copy.about}</p></header><section className="principles">{[['Clarity','We start with the workflow. The interface and data model follow what people need to do.'],['Review','We test the main paths and the places where access, input or a connection can fail.'],['Ownership','We agree who owns each account and document how to operate and update the release.']].map(([name,body])=><article key={name}><h2>{name}</h2><p>{body}</p></article>)}</section><Team/></div>;}
