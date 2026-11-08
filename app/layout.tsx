import PageExperience from '@/components/studio/PageExperience';
import Visit from '@/components/studio/Visit';
import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/studio/Shell';
import {origin} from '@/lib/meta';
export const metadata:Metadata={metadataBase:origin?new URL(origin):undefined,title:'Hash Decode | Software Design & Engineering',description:'An independent software studio for web platforms, digital products and business tools.',icons:{icon:'/logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><head><link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous"/><link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@400;500;600;700&family=Space+Mono:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet"/></head><body id="top"><Header/><main id="main" tabIndex={-1}><PageExperience/>{children}</main><Footer/><Visit/></body></html>;
}
