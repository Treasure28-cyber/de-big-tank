import { PrismaClient, ServiceLine } from '@prisma/client';

const prisma = new PrismaClient();

const categories = [
  { id: 'cat-mains', name: 'Mains', slug: 'mains', serviceLine: ServiceLine.RESTAURANT, sortOrder: 0 },
  { id: 'cat-grills', name: 'Grills', slug: 'grills', serviceLine: ServiceLine.RESTAURANT, sortOrder: 1 },
  { id: 'cat-cakes', name: 'Cakes', slug: 'cakes', serviceLine: ServiceLine.BAKERY, sortOrder: 0 },
  { id: 'cat-pastries', name: 'Pastries', slug: 'pastries', serviceLine: ServiceLine.BAKERY, sortOrder: 1 },
  { id: 'cat-cocktails', name: 'Cocktails', slug: 'cocktails', serviceLine: ServiceLine.LOUNGE, sortOrder: 0 },
  { id: 'cat-plates', name: 'Shared Plates', slug: 'shared-plates', serviceLine: ServiceLine.LOUNGE, sortOrder: 1 },
];

const products = [
  { id: 'jollof', name: 'Smoky Jollof Rice', slug: 'smoky-jollof-rice', description: 'Slow-cooked party jollof with grilled chicken and plantain.', price: 6500, imageUrl: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=82', altText: 'Smoky jollof rice served with grilled chicken', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'mains', variants: [] },
  { id: 'suya', name: 'Beef Suya Platter', slug: 'beef-suya-platter', description: 'Spiced beef, onions, tomatoes and house pepper sauce.', price: 7200, imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82', altText: 'Spiced beef suya platter', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'grills', variants: [] },
  { id: 'cake', name: 'Red Velvet Celebration Cake', slug: 'red-velvet-cake', description: 'Four tender layers with cream cheese frosting, made for celebrations.', price: 18500, imageUrl: 'https://images.unsplash.com/photo-1586788680434-30d324a6cda3?auto=format&fit=crop&w=1200&q=82', altText: 'Red velvet celebration cake', isAvailable: true, allowsSpecialNotes: true, categorySlug: 'cakes', variants: [{ name: '8 inch', priceDelta: 0 }, { name: '10 inch', priceDelta: 6500 }] },
  { id: 'croissant', name: 'Butter Croissant', slug: 'butter-croissant', description: 'Freshly baked, crisp and deeply buttery.', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82', altText: 'Fresh butter croissants', isAvailable: false, allowsSpecialNotes: false, categorySlug: 'pastries', variants: [] },
  { id: 'mojito', name: 'Passionfruit Mojito', slug: 'passionfruit-mojito', description: 'Fresh mint, citrus and passionfruit over ice.', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=82', altText: 'Passionfruit mojito cocktail', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'cocktails', variants: [{ name: 'Zero-proof', priceDelta: -500 }, { name: 'Classic', priceDelta: 0 }] },
  { id: 'platter', name: 'After Hours Platter', slug: 'after-hours-platter', description: 'Wings, fries, sliders and signature dips for the table.', price: 14500, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=82', altText: 'Shared platter with wings, fries and sliders', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'shared-plates', variants: [] },
];

async function main() {
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const saved = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, serviceLine: category.serviceLine, sortOrder: category.sortOrder, isActive: true },
      create: { ...category, isActive: true },
    });
    categoryIds.set(category.slug, saved.id);
  }

  for (const product of products) {
    const { categorySlug, variants, ...data } = product;
    const categoryId = categoryIds.get(categorySlug);
    if (!categoryId) throw new Error(`Missing category for ${product.name}`);
    const saved = await prisma.product.upsert({
      where: { slug: product.slug },
      update: { ...data, categoryId, variants: { deleteMany: {}, create: variants.map((variant, sortOrder) => ({ ...variant, sortOrder, isAvailable: true })) } },
      create: { ...data, categoryId, variants: { create: variants.map((variant, sortOrder) => ({ ...variant, sortOrder, isAvailable: true })) } },
    });
    await prisma.galleryImage.upsert({
      where: { id: `gallery-${product.id}` },
      update: { imageUrl: product.imageUrl, altText: product.altText, caption: product.name, isActive: true },
      create: { id: `gallery-${product.id}`, imageUrl: product.imageUrl, altText: product.altText, caption: product.name, sortOrder: products.indexOf(product), isActive: true },
    });
    console.log(`Imported ${saved.name}`);
  }

  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: { address: 'Warri, Delta State, Nigeria — full address to be confirmed' },
    create: {
      id: 'default',
      businessName: 'De Big Tank',
      tagline: 'Restaurant, Bakery & Lounge',
      whatsappNumber: '2348000000000',
      phone: '+234 800 000 0000',
      email: 'hello@de-bigtank.example',
      address: 'Warri, Delta State, Nigeria — full address to be confirmed',
      businessHours: { Monday: '10:00am – 11:00pm', Tuesday: '10:00am – 11:00pm', Wednesday: '10:00am – 11:00pm', Thursday: '10:00am – 11:00pm', Friday: '10:00am – late', Saturday: '10:00am – late', Sunday: '12:00pm – 10:00pm' },
      socialLinks: {},
      heroTitle: 'One house. Three ways to gather.',
      heroSubtitle: 'Come for generous plates, fresh bakes and evenings that settle into something special.',
      heroImageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=2000&q=88',
      heroImageAlt: 'A table filled with colourful dishes',
    },
  });
}

main()
  .finally(() => prisma.$disconnect());
