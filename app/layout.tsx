import PageExperience from '@/components/studio/PageExperience';
import Visit from '@/components/studio/Visit';
import type {Metadata} from 'next';
import './globals.css';
import {Header,Footer} from '@/components/studio/Shell';
import {origin} from '@/lib/meta';
export const metadata:Metadata={metadataBase:origin?new URL(origin):undefined,title:'Hash Decode | Software Design & Engineering',description:'An independent software studio for web platforms, digital products and business tools.',icons:{icon:'/favicon.svg'}};
export default function RootLayout({children}:{children:React.ReactNode}){
 return <html lang="en"><body id="top"><Header/><main id="main" tabIndex={-1}><PageExperience/>{children}</main><Footer/><Visit/></body></html>;
}
