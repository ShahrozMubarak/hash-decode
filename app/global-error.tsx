'use client';
import Recovery from '@/components/studio/Recovery';
import './globals.css';
export default function GlobalError({reset}:{reset:()=>void}){
 return <html lang="en"><body><main><Recovery reset={reset}/></main></body></html>;
}
