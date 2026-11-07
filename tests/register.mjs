// Resolve the production aliases against the actual route modules. Only the platform identity
// and D1 transport are replaced; queries execute on a fresh local SQLite database.
import {registerHooks} from 'node:module';
import {existsSync} from 'node:fs';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {resolve as pathResolve} from 'node:path';
const root=fileURLToPath(new URL('../',import.meta.url));
registerHooks({resolve(specifier,context,next){
 if(['cloudflare:workers','next/headers','next/navigation'].includes(specifier))return {url:new URL('./platform.mjs',import.meta.url).href,shortCircuit:true};
 if(specifier.startsWith('@/')){const base=pathResolve(root,specifier.slice(2));for(const p of [base+'.ts',base+'/index.ts',base+'.mjs'])if(existsSync(p))return {url:pathToFileURL(p).href,shortCircuit:true};}
 if(specifier.startsWith('.') && context.parentURL?.startsWith('file:') && !context.parentURL.includes('node_modules')){const candidate=new URL(specifier+'.ts',context.parentURL);if(existsSync(candidate))return {url:candidate.href,shortCircuit:true};}
 return next(specifier,context);
}});
