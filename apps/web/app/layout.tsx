import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'De Big Tank | Restaurant, Bakery & Lounge',
    template: '%s | De Big Tank',
  },
  description: 'Discover generous dining, fresh baking and memorable lounge evenings at De Big Tank.',
  openGraph: {
    title: 'De Big Tank | Restaurant, Bakery & Lounge',
    description: 'One house. Three ways to gather.',
    type: 'website',
    images: [{ url: '/og-v2.png', width: 1732, height: 909, alt: 'De Big Tank — Restaurant, Bakery and Lounge' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'De Big Tank | Restaurant, Bakery & Lounge',
    description: 'One house. Three ways to gather.',
    images: ['/og-v2.png'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
