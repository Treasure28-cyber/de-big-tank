import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { PrismaClient, ServiceLine } from '@prisma/client';

const prisma = new PrismaClient();
const publicImage = (path: string) => new URL(path, process.env.WEB_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:3000').href;

const categories = [
  { id: 'cat-mains', name: 'Mains', slug: 'mains', serviceLine: ServiceLine.RESTAURANT, sortOrder: 0 },
  { id: 'cat-grills', name: 'Grills', slug: 'grills', serviceLine: ServiceLine.RESTAURANT, sortOrder: 1 },
  { id: 'cat-cakes', name: 'Cakes', slug: 'cakes', serviceLine: ServiceLine.BAKERY, sortOrder: 0 },
  { id: 'cat-pastries', name: 'Pastries', slug: 'pastries', serviceLine: ServiceLine.BAKERY, sortOrder: 1 },
  { id: 'cat-cocktails', name: 'Cocktails', slug: 'cocktails', serviceLine: ServiceLine.LOUNGE, sortOrder: 0 },
  { id: 'cat-plates', name: 'Shared Plates', slug: 'shared-plates', serviceLine: ServiceLine.LOUNGE, sortOrder: 1 },
];

const products = [
  { id: 'jollof', name: 'Rice', slug: 'smoky-jollof-rice', description: 'Party jollof the way it is supposed to taste — slow-cooked, smoky, deeply flavoured, with grilled chicken and ripe plantain. The version that makes everyone at the table claim they are not hungry and then ask for seconds.', price: 6500, imageUrl: publicImage('/jollof-chicken-plantain.jpg'), altText: 'Nigerian jollof rice with grilled chicken and golden fried plantain', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'mains', variants: [] },
  { id: 'suya', name: 'Smoked Beef Ribs', slug: 'beef-suya-platter', description: 'Spiced, smoked until the meat barely needs a knife, and served with a house pepper sauce that earns its place on the plate. The kind of dish you remember when you are deciding where to eat next time.', price: 7200, imageUrl: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82', altText: 'Smoked beef ribs with house pepper sauce', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'grills', variants: [] },
  { id: 'cake', name: 'Celebration Cake', slug: 'red-velvet-cake', description: 'Four layers of properly moist sponge with cream cheese frosting, finished to your specification. Built for the moments that deserve more than a supermarket shelf. Because the people you are celebrating deserve better than ordinary.', price: 18500, imageUrl: publicImage('/celebration-cake.jpg'), altText: 'Celebration cake with white flowers and chocolate drips', isAvailable: true, allowsSpecialNotes: true, categorySlug: 'cakes', variants: [{ name: '8 inch', priceDelta: 0 }, { name: '10 inch', priceDelta: 5500 }] },
  { id: 'croissant', name: 'Butter Croissant', slug: 'butter-croissant', description: 'Freshly baked, crisp and deeply buttery.', price: 2200, imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82', altText: 'Fresh butter croissants', isAvailable: false, allowsSpecialNotes: false, categorySlug: 'pastries', variants: [] },
  { id: 'mojito', name: 'Passionfruit Mojito', slug: 'passionfruit-mojito', description: 'Fresh mint, citrus and passionfruit over ice.', price: 5500, imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=82', altText: 'Passionfruit mojito cocktail', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'cocktails', variants: [{ name: 'Zero-proof', priceDelta: -500 }, { name: 'Classic', priceDelta: 0 }] },
  { id: 'platter', name: 'After Hours Platter', slug: 'after-hours-platter', description: 'Wings, fries, sliders and signature dips for the table.', price: 14500, imageUrl: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=82', altText: 'Shared platter with wings, fries and sliders', isAvailable: true, allowsSpecialNotes: false, categorySlug: 'shared-plates', variants: [] },
];

async function main() {
  await ConfigModule.forRoot({ envFilePath: resolve(__dirname, '../.env') });
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

  const bakeryGallery = [
    { id: 'gallery-sharing-jollof', imageUrl: publicImage('/jollof-sharing-platter.jpg'), altText: 'A sharing platter of jollof rice topped with grilled chicken', caption: 'Made for the whole table' },
    { id: 'gallery-bread', imageUrl: publicImage('/artisan-bread.jpg'), altText: 'Sliced golden bread served with butter', caption: 'Freshly baked bread' },
    { id: 'gallery-banana-bread', imageUrl: publicImage('/banana-nut-bread.jpg'), altText: 'Banana bread with walnuts and chocolate chips', caption: 'Banana nut bread' },
    { id: 'gallery-red-velvet', imageUrl: publicImage('/red-velvet-slice.jpg'), altText: 'Red velvet cake layered with cream cheese frosting', caption: 'A little something sweet' },
  ];
  for (const [index, entry] of bakeryGallery.entries()) {
    await prisma.galleryImage.upsert({
      where: { id: entry.id },
      update: { ...entry, isActive: true },
      create: { ...entry, sortOrder: products.length + index, isActive: true },
    });
  }

  const settings = {
    businessName: 'De Big Tank',
    tagline: 'Restaurant · Bakery · Lounge',
    whatsappNumber: '2347037236666',
    phone: '07037236666',
    email: 'de.bigtankassociate@gmail.com',
    address: 'Km 1 Ugbomro Road, Warri, Delta State, Nigeria',
    businessHours: { Restaurant: '11am – 10pm', Bakery: '9am – 8pm', Lounge: '6pm – 11pm' },
    heroTitle: 'The best part of your day happens here.',
    heroSubtitle: 'Restaurant. Bakery. Lounge. Whatever mood finds you — hungry, celebratory, or in need of a good evening — De Big Tank has the room, the food and the people for it.',
  };
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: settings,
    create: { id: 'default', ...settings, socialLinks: {} },
  });

  const friday = {
    title: 'The right way to end the week.',
    description: 'Gather the people who matter. Signature cocktails, generous shared plates and an atmosphere that makes the whole week worth it. This is not just Friday night out — this is the Friday night people ask about on Saturday morning. Reservations recommended.',
    imageUrl: publicImage('/friday-friends-1088.webp'),
    isActive: true,
  };
  await prisma.promotion.upsert({
    where: { slug: 'friday-lounge-service' },
    update: friday,
    create: { id: 'friday', slug: 'friday-lounge-service', ...friday },
  });
}

main()
  .finally(() => prisma.$disconnect());
