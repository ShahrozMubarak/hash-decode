'use client';
export default function Recovery({reset}:{reset:()=>void}){
 return <section className="wrap interior"><div className="page-intro"><p className="kicker"><span className="key-line"/>Hash Decode</p><h1>This page could not load.</h1><p>Please try again, or return to the studio.</p><div className="actions"><button className="cta" onClick={reset}>Try again</button><a href="/" className="text-link">Studio home ↗</a></div></div></section>;
}
