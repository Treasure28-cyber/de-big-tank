import { notFound } from 'next/navigation';
import Site from '../../components/site';
import type { PublicSlug } from '../../components/site';

const pages = new Set<PublicSlug>(['restaurant', 'bakery', 'lounge', 'gallery', 'about', 'promotions', 'contact', 'reserve']);

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!pages.has(slug as PublicSlug)) notFound();
  return <Site slug={slug as PublicSlug} />;
}
