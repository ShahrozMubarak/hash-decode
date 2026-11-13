import type {Metadata} from 'next';
export function validOrigin(value:unknown){
  try{
    const url=new URL(String(value));
    return url.protocol==='https:' && !url.username && !url.password && url.pathname==='/' && !url.search && !url.hash ? url.origin : '';
  }catch{return '';}
}
export const origin=validOrigin(process.env.SITE_ORIGIN);
export function meta(title:string,description:string,path:string):Metadata {
 const fullTitle=title.length<=44 ? title+' | Hash Decode' : title.slice(0,59);
 const summary=description.trim().slice(0,159);
 const canonical=origin ? new URL(path,origin).href : undefined;
 
 return {
   title:fullTitle,
   description:summary,
   alternates:{canonical},
   openGraph:{
      title:fullTitle,
      description:summary,
     url:canonical,
     siteName:'Hash Decode',
     type:'website',
     ...(origin?{images:[{url:origin+'/studio-og.png',width:1200,height:630,alt:'Hash Decode software and web security studio'}]}:{})
   },
   twitter:{
     card:'summary_large_image',
     title:fullTitle,
     description:summary,
     ...(origin?{images:[origin+'/studio-og.png']}:{})
   },
   ...(!origin?{robots:{index:false,follow:false}}:{})
 };
}
