import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Site from '../../components/site';
import type { PublicSlug } from '../../components/site';
import { fallbackProducts, type Product } from '../../lib/content';

const pages = new Set<PublicSlug>(['menu', 'restaurant', 'bakery', 'lounge', 'about', 'contact', 'reserve']);

const pageMetadata: Record<PublicSlug, { title: string; description: string; image: string }> = {
  menu: { title: 'Food, Cakes & Drinks Menu in Warri', description: 'Browse Nigerian food, grills, celebration cakes, pastries, cocktails and shared plates from De Big Tank in Warri, Delta State.', image: '/menu-hero-v1.webp' },
  restaurant: { title: 'Nigerian Restaurant in Warri', description: 'Explore Nigerian favourites, fire-kissed grills and generous plates at De Big Tank restaurant in Warri, Delta State.', image: '/restaurant-hero-overlay.webp' },
  bakery: { title: 'Bakery & Celebration Cakes in Warri', description: 'Order fresh pastries, buttery bakes and celebration cakes from De Big Tank bakery in Warri, Delta State.', image: '/bakery-hero-overlay.webp' },
  lounge: { title: 'Lounge & Cocktails in Warri', description: 'Visit De Big Tank lounge in Warri for signature cocktails, shared plates and relaxed evenings in Delta State.', image: '/lounge-interior.jpeg' },
  about: { title: 'About Our Warri Restaurant', description: 'Learn about De Big Tank and our restaurant, bakery and lounge experiences in Warri, Delta State.', image: '/shared-brand-hero.webp' },
  contact: { title: 'Contact Our Warri Restaurant', description: 'Contact De Big Tank in Warri, check current opening hours and plan your visit.', image: '/og-v2.webp' },
  reserve: { title: 'Reserve a Table in Warri', description: 'Request a table at De Big Tank restaurant and lounge in Warri and receive confirmation directly from our team.', image: '/og-v2.webp' },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  if (slug === 'products') return { robots: { index: false, follow: true }, alternates: { canonical: '/menu' } };
  if (!pages.has(slug as PublicSlug)) return {};
  const current = pageMetadata[slug as PublicSlug];
  return {
    title: current.title,
    description: current.description,
    alternates: { canonical: `/${slug}` },
    openGraph: { title: `${current.title} | De Big Tank`, description: current.description, url: `/${slug}`, siteName: 'De Big Tank', type: 'website', locale: 'en_NG', images: [{ url: current.image, alt: `${current.title} at De Big Tank` }] },
    twitter: { card: 'summary_large_image', title: `${current.title} | De Big Tank`, description: current.description, images: [current.image] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === 'products') redirect('/menu');
  if (!pages.has(slug as PublicSlug)) notFound();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  const current = pageMetadata[slug as PublicSlug];
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: current.title, item: `${siteUrl}/${slug}` },
    ],
  };
  let productStructuredData: object | null = null;
  if (slug === 'menu') {
    let products: Product[] = fallbackProducts;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'}/products`, { next: { revalidate: 300 } });
      const apiProducts = response.ok ? await response.json() as Product[] : [];
      if (apiProducts.length) products = apiProducts;
    } catch { /* Use the same visible fallback catalog when the content API is unavailable. */ }
    productStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'De Big Tank food, bakery and lounge menu',
      itemListElement: products.map((product, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Product',
          name: product.name,
          description: product.description,
          image: product.imageUrl,
          category: product.category.name,
          offers: {
            '@type': 'Offer',
            priceCurrency: 'NGN',
            price: Number(product.price),
            availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
            url: `${siteUrl}/menu`,
          },
        },
      })),
    };
  }
  return <>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, '\\u003c') }} />
    {productStructuredData && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productStructuredData).replace(/</g, '\\u003c') }} />}
    <Site slug={slug as PublicSlug} />
  </>;
}
