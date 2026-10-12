export type Line = 'RESTAURANT' | 'BAKERY' | 'LOUNGE';

export type Category = {
  id: string;
  name: string;
  slug: string;
  serviceLine: Line;
  isActive: boolean;
};

export type Variant = {
  id: string;
  name: string;
  priceDelta: number | string;
  isAvailable: boolean;
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number | string;
  imageUrl?: string | null;
  altText?: string | null;
  isAvailable: boolean;
  allowsSpecialNotes: boolean;
  category: Category;
  variants: Variant[];
};

export type GalleryImage = {
  id: string;
  imageUrl: string;
  altText: string;
  caption?: string | null;
};

export type Promotion = {
  id: string;
  slug?: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  startsAt?: string | null;
  endsAt?: string | null;
};

export type SiteSettings = {
  businessName: string;
  tagline: string;
  whatsappNumber: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  mapEmbedUrl?: string | null;
  businessHours?: Record<string, string> | null;
  socialLinks?: Record<string, string> | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  heroImageUrl?: string | null;
  heroImageAlt?: string | null;
};

const categories: Category[] = [
  { id: 'cat-mains', name: 'Mains', slug: 'mains', serviceLine: 'RESTAURANT', isActive: true },
  { id: 'cat-grills', name: 'Grills', slug: 'grills', serviceLine: 'RESTAURANT', isActive: true },
  { id: 'cat-cakes', name: 'Cakes', slug: 'cakes', serviceLine: 'BAKERY', isActive: true },
  { id: 'cat-pastries', name: 'Pastries', slug: 'pastries', serviceLine: 'BAKERY', isActive: true },
  { id: 'cat-cocktails', name: 'Cocktails', slug: 'cocktails', serviceLine: 'LOUNGE', isActive: true },
  { id: 'cat-plates', name: 'Shared Plates', slug: 'shared-plates', serviceLine: 'LOUNGE', isActive: true },
];

const image = {
  jollof: '/jollof-chicken-plantain.jpg',
  suya: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82',
  cake: '/celebration-cake.jpg',
  pastry: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82',
  cocktail: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=82',
  platter: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=82',
};

export const fallbackProducts: Product[] = [
  { id: 'jollof', name: 'Rice', slug: 'smoky-jollof-rice', description: 'Slow-cooked party jollof with grilled chicken and ripe plantain. The version that makes people ask for the recipe.', price: 6500, imageUrl: image.jollof, altText: 'Nigerian jollof rice with grilled chicken and golden fried plantain', isAvailable: true, allowsSpecialNotes: false, category: categories[0], variants: [] },
  { id: 'suya', name: 'Smoked Beef Ribs', slug: 'beef-suya-platter', description: 'Spiced, smoked and fall-off-the-bone. Served with house pepper sauce and a side of your choice.', price: 7200, imageUrl: image.suya, altText: 'Smoked beef ribs with house pepper sauce', isAvailable: true, allowsSpecialNotes: false, category: categories[1], variants: [] },
  { id: 'cake', name: 'Celebration Cake', slug: 'red-velvet-cake', description: 'Four tender layers of moist sponge with cream cheese frosting, finished to order. Built for the moments that deserve more than candles.', price: 18500, imageUrl: image.cake, altText: 'Celebration cake with white flowers and chocolate drips', isAvailable: true, allowsSpecialNotes: true, category: categories[2], variants: [{ id: 'cake-8', name: '8 inch', priceDelta: 0, isAvailable: true }, { id: 'cake-10', name: '10 inch', priceDelta: 5500, isAvailable: true }] },
  { id: 'croissant', name: 'Butter Croissant', slug: 'butter-croissant', description: 'Freshly baked, crisp and deeply buttery.', price: 2200, imageUrl: image.pastry, altText: 'Fresh butter croissants', isAvailable: false, allowsSpecialNotes: false, category: categories[3], variants: [] },
  { id: 'mojito', name: 'Passionfruit Mojito', slug: 'passionfruit-mojito', description: 'Fresh mint, citrus and passionfruit over ice.', price: 5500, imageUrl: image.cocktail, altText: 'Passionfruit mojito cocktail', isAvailable: true, allowsSpecialNotes: false, category: categories[4], variants: [{ id: 'mojito-zero', name: 'Zero-proof', priceDelta: -500, isAvailable: true }, { id: 'mojito-classic', name: 'Classic', priceDelta: 0, isAvailable: true }] },
  { id: 'platter', name: 'After Hours Platter', slug: 'after-hours-platter', description: 'Wings, fries, sliders and signature dips for the table.', price: 14500, imageUrl: image.platter, altText: 'Shared platter with wings, fries and sliders', isAvailable: true, allowsSpecialNotes: false, category: categories[5], variants: [] },
];

export const fallbackCategories = categories;

export const fallbackGallery: GalleryImage[] = [
  { id: 'gallery-jollof', imageUrl: image.jollof, altText: 'Jollof rice, chicken and fried plantain on a black plate', caption: 'Nigerian favourites' },
  { id: 'gallery-sharing-jollof', imageUrl: '/jollof-sharing-platter.jpg', altText: 'A sharing platter of jollof rice topped with grilled chicken', caption: 'Made for the whole table' },
  { id: 'gallery-cake', imageUrl: image.cake, altText: 'A celebration cake decorated with white flowers and chocolate drips', caption: 'Celebration cakes' },
  { id: 'gallery-bread', imageUrl: '/artisan-bread.jpg', altText: 'Sliced golden bread served with butter', caption: 'Freshly baked bread' },
  { id: 'gallery-banana-bread', imageUrl: '/banana-nut-bread.jpg', altText: 'Banana bread with walnuts, banana slices and chocolate chips', caption: 'Banana nut bread' },
  { id: 'gallery-red-velvet', imageUrl: '/red-velvet-slice.jpg', altText: 'A slice of red velvet cake layered with cream cheese frosting', caption: 'A little something sweet' },
];

export const fallbackPromotions: Promotion[] = [
  { id: 'friday', title: 'Friday Lounge Service.', description: 'Gather your people. Signature cocktails, shared plates and the right energy to close out the week properly. Reservations recommended.', imageUrl: image.cocktail },
  { id: 'cake-preorder', title: 'Celebration Cakes', description: 'Pre-order a celebration cake and tell our bakers exactly how you want it finished.', imageUrl: image.cake },
];

export const fallbackSettings: SiteSettings = {
  businessName: 'De Big Tank',
  tagline: 'Restaurant · Bakery · Lounge',
  whatsappNumber: '2347037236666',
  phone: '07037236666',
  email: 'de.bigtankassociate@gmail.com',
  address: 'Km 1 Ugbomoro Road, Warri, Delta State, Nigeria',
  businessHours: { Restaurant: '11am – 10pm', Bakery: '9am – 8pm', Lounge: '6pm – 11pm' },
  heroTitle: 'One house. Three moods.',
  heroSubtitle: 'Restaurant. Bakery. Lounge. One address for every version of your day, from the first craving to the last round.',
  heroImageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=2000&q=88',
  heroImageAlt: 'A table filled with colourful dishes',
};
