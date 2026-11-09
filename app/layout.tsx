import { Inter, JetBrains_Mono } from 'next/font/google';
import PageExperience from '@/components/studio/PageExperience';
import Visit from '@/components/studio/Visit';
import RevealObserver from '@/components/studio/RevealObserver';
import CardTiltManager from '@/components/studio/CardTiltManager';
import ToastManager from '@/components/studio/ToastManager';
import NavigationProgressBar from '@/components/studio/NavigationProgressBar';
import PageTransition from '@/components/studio/PageTransition';
import type { Metadata, Viewport } from 'next';
import './globals.css';
import './motion-ui.css';
import './motion.css';
import { Header, Footer } from '@/components/studio/Shell';
import { origin } from '@/lib/meta';

const inter = Inter({ subsets: ['latin'], variable: '--font-body', display: 'swap' });
const mono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export const viewport: Viewport = {
  themeColor: '#acb0b0',
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: origin ? new URL(origin) : undefined,
  title: 'Hash Decode | Software Design & Engineering',
  description: 'An independent software studio for web platforms, digital products and business tools.',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/logo.png', sizes: 'any', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/manifest.webmanifest',
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Hash Decode',
  url: origin || 'https://hashdecode.com',
  logo: (origin || 'https://hashdecode.com') + '/logo.png',
  description: 'An independent software studio for web platforms, digital products and business tools.',
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'shaahrozdogar@gmail.com',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body id="top" className={`${inter.variable} ${mono.variable}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <a href="#main" className="skip-link">Skip to main content</a>
        <NavigationProgressBar />
        <RevealObserver />
        <CardTiltManager />
        <ToastManager />
        <Header />
        <main id="main" tabIndex={-1}>
          <PageExperience />
          <PageTransition>
            {children}
          </PageTransition>
        </main>
        <Footer />
        <Visit />
      </body>
    </html>
  );
}
