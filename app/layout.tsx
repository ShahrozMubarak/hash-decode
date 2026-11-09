import { Inter, JetBrains_Mono } from 'next/font/google';
import PageExperience from '@/components/studio/PageExperience';
import Visit from '@/components/studio/Visit';
import RevealObserver from '@/components/studio/RevealObserver';
import CardTiltManager from '@/components/studio/CardTiltManager';
import type {Metadata} from 'next';
import './globals.css';
import './motion-ui.css';
import {Header,Footer} from '@/components/studio/Shell';
import {origin} from '@/lib/meta';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const metadata:Metadata={metadataBase:origin?new URL(origin):undefined,title:'Hash Decode | Software Design & Engineering',description:'An independent software studio for web platforms, digital products and business tools.',icons:{icon:'/logo.png'}};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en" className={`${inter.variable} ${mono.variable}`}><body id="top" className={`${inter.variable} ${mono.variable}`}><RevealObserver/><CardTiltManager/><Header/><main id="main" tabIndex={-1}><PageExperience/>{children}</main><Footer/><Visit/></body></html>;
}
