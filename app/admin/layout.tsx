import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Command | Hash Decode Atelier',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-root-wrapper" style={{ background: '#dfe3e3', minHeight: '100svh' }}>
      {children}
    </div>
  );
}
