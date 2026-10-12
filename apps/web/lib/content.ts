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
  jollof: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=1200&q=82',
  suya: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&w=1200&q=82',
  cake: 'https://images.unsplash.com/photo-1586788680434-30d324a6cda3?auto=format&fit=crop&w=1200&q=82',
  pastry: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=82',
  cocktail: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=1200&q=82',
  platter: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=1200&q=82',
};

export const fallbackProducts: Product[] = [
  { id: 'jollof', name: 'Smoky Jollof Rice', slug: 'smoky-jollof-rice', description: 'Slow-cooked party jollof with grilled chicken and plantain.', price: 6500, imageUrl: image.jollof, altText: 'Smoky jollof rice served with grilled chicken', isAvailable: true, allowsSpecialNotes: false, category: categories[0], variants: [] },
  { id: 'suya', name: 'Beef Suya Platter', slug: 'beef-suya-platter', description: 'Spiced beef, onions, tomatoes and house pepper sauce.', price: 7200, imageUrl: image.suya, altText: 'Spiced beef suya platter', isAvailable: true, allowsSpecialNotes: false, category: categories[1], variants: [] },
  { id: 'cake', name: 'Red Velvet Celebration Cake', slug: 'red-velvet-cake', description: 'Four tender layers with cream cheese frosting, made for celebrations.', price: 18500, imageUrl: image.cake, altText: 'Red velvet celebration cake', isAvailable: true, allowsSpecialNotes: true, category: categories[2], variants: [{ id: 'cake-8', name: '8 inch', priceDelta: 0, isAvailable: true }, { id: 'cake-10', name: '10 inch', priceDelta: 6500, isAvailable: true }] },
  { id: 'croissant', name: 'Butter Croissant', slug: 'butter-croissant', description: 'Freshly baked, crisp and deeply buttery.', price: 2200, imageUrl: image.pastry, altText: 'Fresh butter croissants', isAvailable: false, allowsSpecialNotes: false, category: categories[3], variants: [] },
  { id: 'mojito', name: 'Passionfruit Mojito', slug: 'passionfruit-mojito', description: 'Fresh mint, citrus and passionfruit over ice.', price: 5500, imageUrl: image.cocktail, altText: 'Passionfruit mojito cocktail', isAvailable: true, allowsSpecialNotes: false, category: categories[4], variants: [{ id: 'mojito-zero', name: 'Zero-proof', priceDelta: -500, isAvailable: true }, { id: 'mojito-classic', name: 'Classic', priceDelta: 0, isAvailable: true }] },
  { id: 'platter', name: 'After Hours Platter', slug: 'after-hours-platter', description: 'Wings, fries, sliders and signature dips for the table.', price: 14500, imageUrl: image.platter, altText: 'Shared platter with wings, fries and sliders', isAvailable: true, allowsSpecialNotes: false, category: categories[5], variants: [] },
];

export const fallbackCategories = categories;

export const fallbackGallery: GalleryImage[] = fallbackProducts.map((product) => ({
  id: `gallery-${product.id}`,
  imageUrl: product.imageUrl!,
  altText: product.altText ?? product.name,
  caption: product.name,
}));

export const fallbackPromotions: Promotion[] = [
  { id: 'friday', title: 'Friday Lounge Service', description: 'Gather over signature shared plates and cocktails every Friday from 6pm.', imageUrl: image.cocktail },
  { id: 'cake-preorder', title: 'Celebration Cakes', description: 'Pre-order a celebration cake and tell our bakers exactly how you want it finished.', imageUrl: image.cake },
];

export const fallbackSettings: SiteSettings = {
  businessName: 'De Big Tank',
  tagline: 'Restaurant, Bakery & Lounge',
  whatsappNumber: '2348000000000',
  phone: '+234 800 000 0000',
  email: 'hello@de-bigtank.example',
  address: 'Warri, Delta State, Nigeria — full address to be confirmed',
  businessHours: { Monday: '10:00am – 11:00pm', Tuesday: '10:00am – 11:00pm', Wednesday: '10:00am – 11:00pm', Thursday: '10:00am – 11:00pm', Friday: '10:00am – late', Saturday: '10:00am – late', Sunday: '12:00pm – 10:00pm' },
  heroTitle: 'One house. Three ways to gather.',
  heroSubtitle: 'Come for generous plates, fresh bakes and evenings that settle into something special.',
  heroImageUrl: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=2000&q=88',
  heroImageAlt: 'A table filled with colourful dishes',
};
