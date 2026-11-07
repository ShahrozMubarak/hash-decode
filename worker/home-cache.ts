// Cache only the anonymous HTML representation. Each delivery receives a fresh CSP nonce.
export const homeRequest=(req:Request)=>{
 const url=new URL(req.url);
 return req.method==='GET' && url.pathname==='/' && !url.search && req.headers.get('accept')?.includes('text/html') &&
  !['authorization','cookie','rsc','next-action','next-router-state-tree','range'].some(k=>req.headers.has(k));
};
export function stampHtml(response:Response,from:string,to:string){
 return new HTMLRewriter().on('script[nonce],style[nonce]',{element(el){if(el.getAttribute('nonce')===from)el.setAttribute('nonce',to);}}).transform(response);
}
