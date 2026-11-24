import { ConfigModule } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const photos = [
  ['gallery-jollof', 'jollof-chicken-plantain.jpg', 'Jollof rice with grilled chicken and ripe plantain', 'Nigerian favourites'],
  ['gallery-sharing-jollof', 'jollof-sharing-platter.jpg', 'A platter of jollof rice topped with grilled chicken', 'Made for the whole table'],
  ['gallery-cake', 'celebration-cake.jpg', 'Celebration cake with white flowers and chocolate drips', 'Celebration cakes'],
  ['gallery-bread', 'artisan-bread.jpg', 'Sliced golden bread served with butter', 'Freshly baked bread'],
  ['gallery-friday-friends', 'friday-friends-1088.webp', 'Friends enjoying drinks around a restaurant table', 'Good company. Great evenings.'],
  ['gallery-lounge', 'lounge-interior.jpeg', 'The warm lounge interior with the Stay Awhile sign', 'Stay awhile'],
  ['gallery-banana-bread', 'banana-nut-bread.jpg', 'Banana bread with walnuts and chocolate chips', 'Banana nut bread'],
  ['gallery-red-velvet', 'red-velvet-slice.jpg', 'A slice of red velvet cake with cream cheese frosting', 'A little something sweet'],
  ['gallery-restaurant', 'restaurant-hero-overlay.webp', 'The De Big Tank restaurant dining room', 'A place at our table'],
  ['gallery-bakery', 'bakery-hero-overlay.webp', 'A display of breads and pastries', 'Fresh from the bakery'],
  ['gallery-bakery-bread', 'bakery-hero-bread.webp', 'Fresh bread from the bakery', 'Baked for your morning'],
  ['gallery-menu-table', 'menu-hero-v1.webp', 'Nigerian dishes, bakes and drinks on a table', 'Three ways to enjoy your day'],
  ['gallery-hospitality', 'shared-brand-hero.webp', 'A warmly lit hospitality setting', 'Make yourself at home'],
];

async function main() {
  await ConfigModule.forRoot({ envFilePath: resolve(__dirname, '../.env') });
  const origin = process.env.WEB_ORIGIN?.split(',')[0]?.trim() || 'http://localhost:3000';
  const prisma = new PrismaClient();
  try {
    let added = 0, repaired = 0;
    for (const [sortOrder, [id, filename, altText, caption]] of photos.entries()) {
      if (!existsSync(resolve(__dirname, '../../web/public', filename))) throw new Error(`Missing gallery asset: ${filename}`);
      const imageUrl = new URL(`/${filename}`, origin).href;
      const current = await prisma.galleryImage.findUnique({ where: { id } });
      if (!current) {
        // Do not duplicate an image already added manually under another ID.
        const duplicate = await prisma.galleryImage.findFirst({ where: { imageUrl } });
        if (!duplicate) {
          await prisma.galleryImage.create({ data: { id, imageUrl, altText, caption, sortOrder, isActive: true } });
          added++;
        }
      } else if ((id === 'gallery-jollof' || id === 'gallery-cake') && current.imageUrl.startsWith('https://images.unsplash.com/')) {
        // Replace only the old built-in stock images; preserve staff-written details.
        await prisma.galleryImage.update({ where: { id }, data: { imageUrl } });
        repaired++;
      }
    }
    console.log(`Gallery synchronized: ${added} photos added, ${repaired} legacy image URLs repaired. Existing edits and visibility preserved.`);
  } finally { await prisma.$disconnect(); }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : 'Gallery synchronization failed.');
  process.exitCode = 1;
});
