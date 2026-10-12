import type { MetadataRoute } from 'next';

const routes = ['', '/menu', '/restaurant', '/bakery', '/lounge', '/about', '/contact', '/reserve'];

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
  return routes.map((route) => ({
    url: `${siteUrl}${route}`,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : ['/restaurant', '/bakery', '/lounge'].includes(route) ? 0.9 : 0.7,
  }));
}
