import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: {
    default: 'De Big Tank | Restaurant in Warri, Delta State',
    template: '%s | De Big Tank',
  },
  description: 'Visit De Big Tank restaurant, bakery and lounge in Warri, Delta State for Nigerian food, grills, cakes, pastries and cocktails.',
  alternates: { canonical: '/' },
  applicationName: 'De Big Tank',
  category: 'food and drink',
  keywords: ['restaurant in Warri', 'best restaurant in Warri', 'Nigerian restaurant Warri', 'bakery in Warri', 'cakes in Warri', 'lounge in Warri', 'restaurant in Delta State', 'De Big Tank'],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 },
  },
  openGraph: {
    title: 'De Big Tank | Restaurant in Warri, Delta State',
    description: 'Nigerian food, fresh cakes and pastries, cocktails and lounge evenings in Warri.',
    type: 'website',
    images: [{ url: '/og-v2.webp', width: 1732, height: 909, alt: 'De Big Tank — Restaurant, Bakery and Lounge' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'De Big Tank | Restaurant, Bakery & Lounge',
    description: 'One house. Three ways to gather.',
    images: ['/og-v2.webp'],
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Restaurant', 'Bakery', 'BarOrPub'],
        '@id': `${siteUrl}/#organization`,
        name: 'De Big Tank',
        url: siteUrl,
        logo: `${siteUrl}/brand-logo-maroon.webp`,
        description: 'A restaurant, bakery and lounge in Warri, Delta State for Nigerian food, fresh baking, cocktails and memorable evenings.',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Warri',
          addressRegion: 'Delta State',
          addressCountry: 'NG',
        },
        servesCuisine: ['Nigerian', 'African', 'Bakery', 'Grills'],
        priceRange: '₦₦',
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'De Big Tank',
        publisher: { '@id': `${siteUrl}/#organization` },
        inLanguage: 'en-NG',
      },
    ],
  };
  return (
    <html lang="en">
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
        {children}
      </body>
    </html>
  );
}
