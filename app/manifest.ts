import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Hash Decode Studio',
    short_name: 'Hash Decode',
    description: 'An independent software studio for web platforms, digital products and business tools.',
    start_url: '/',
    display: 'standalone',
    background_color: '#dfe3e3',
    theme_color: '#acb0b0',
    icons: [
      {
        src: '/favicon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
      {
        src: '/favicon-32x32.png',
        sizes: '32x32',
        type: 'image/png',
      },
      {
        src: '/apple-touch-icon.png',
        sizes: '180x180',
        type: 'image/png',
      },
      {
        src: '/logo.png',
        sizes: '640x640',
        type: 'image/png',
      },
    ],
  };
}
