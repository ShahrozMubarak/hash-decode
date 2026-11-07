import {capabilities,faq} from './landing-content';
export function studioSchema(origin:string,area:string){
 const organization={'@type':'Organization','@id':origin+'/#studio',name:'Hash Decode',url:origin,logo:origin+'/favicon.svg'};
 return {'@context':'https://schema.org','@graph':[organization,
  {'@type':'WebSite','@id':origin+'/#website',name:'Hash Decode',url:origin,publisher:{'@id':organization['@id']}},
  {'@type':'ProfessionalService','@id':origin+'/#services',name:'Hash Decode',url:origin+'/services',image:origin+'/studio-og.png',parentOrganization:{'@id':organization['@id']},...(area?{areaServed:area}:{}),hasOfferCatalog:{'@type':'OfferCatalog',name:'Software and web security services',itemListElement:capabilities.map(([,name,description])=>({'@type':'Offer',itemOffered:{'@type':'Service',name,description}}))}},
  {'@type':'FAQPage','@id':origin+'/#faq',mainEntity:faq.map(([name,text])=>({'@type':'Question',name,acceptedAnswer:{'@type':'Answer',text}}))}
 ]};
}
export const safeJson=(data:unknown)=>JSON.stringify(data).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
