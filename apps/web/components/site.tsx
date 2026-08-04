'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  Category,
  fallbackCategories,
  fallbackGallery,
  fallbackProducts,
  fallbackPromotions,
  fallbackSettings,
  GalleryImage,
  Line,
  Product,
  Promotion,
  SiteSettings,
  Variant,
} from '../lib/content';

export type PublicSlug = 'restaurant' | 'bakery' | 'lounge' | 'gallery' | 'about' | 'promotions' | 'contact' | 'reserve';
type CartItem = {
  key: string;
  productId: string;
  name: string;
  imageUrl?: string | null;
  variant?: { id: string; name: string; priceDelta: number };
  unitPrice: number;
  quantity: number;
  note: string;
};
type Content = {
  products: Product[];
  categories: Category[];
  gallery: GalleryImage[];
  promotions: Promotion[];
  settings: SiteSettings;
};

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
const nav = [
  ['Home', '/'],
  ['Restaurant', '/restaurant'],
  ['Bakery', '/bakery'],
  ['Lounge', '/lounge'],
  ['Gallery', '/gallery'],
  ['Promotions', '/promotions'],
  ['About', '/about'],
  ['Contact', '/contact'],
] as const;
const defaultContent: Content = {
  products: fallbackProducts,
  categories: fallbackCategories,
  gallery: fallbackGallery,
  promotions: fallbackPromotions,
  settings: fallbackSettings,
};
const naira = (value: number) => new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  maximumFractionDigits: 0,
}).format(value);
const lineFromSlug = (slug?: string): Line | undefined => {
  if (slug === 'restaurant') return 'RESTAURANT';
  if (slug === 'bakery') return 'BAKERY';
  if (slug === 'lounge') return 'LOUNGE';
  return undefined;
};

export default function Site({ slug }: { slug?: PublicSlug }) {
  const [content, setContent] = useState<Content>(defaultContent);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartReady, setCartReady] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem('dbt-cart-v1');
      if (stored) setCart(JSON.parse(stored) as CartItem[]);
    } catch {
      window.localStorage.removeItem('dbt-cart-v1');
    } finally {
      setCartReady(true);
    }
  }, []);

  useEffect(() => {
    if (cartReady) window.localStorage.setItem('dbt-cart-v1', JSON.stringify(cart));
  }, [cart, cartReady]);

  useEffect(() => {
    const controller = new AbortController();
    Promise.all([
      fetch(`${apiUrl}/products`, { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<Product[]> : Promise.reject()),
      fetch(`${apiUrl}/categories`, { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<Category[]> : Promise.reject()),
      fetch(`${apiUrl}/gallery`, { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<GalleryImage[]> : Promise.reject()),
      fetch(`${apiUrl}/promotions`, { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<Promotion[]> : Promise.reject()),
      fetch(`${apiUrl}/settings`, { signal: controller.signal }).then((response) => response.ok ? response.json() as Promise<SiteSettings | null> : Promise.reject()),
    ]).then(([products, categories, gallery, promotions, settings]) => {
      setContent({
        products: products.length ? products : fallbackProducts,
        categories: categories.length ? categories : fallbackCategories,
        gallery: gallery.length ? gallery : fallbackGallery,
        promotions: promotions.length ? promotions : fallbackPromotions,
        settings: settings ?? fallbackSettings,
      });
    }).catch(() => {
      // The polished demo content remains visible when the content API is not configured.
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [slug]);

  const addToCart = (product: Product, variant?: Variant) => {
    const selectedVariant = variant ? {
      id: variant.id,
      name: variant.name,
      priceDelta: Number(variant.priceDelta),
    } : undefined;
    const key = `${product.id}:${selectedVariant?.id ?? 'base'}`;
    setCart((items) => {
      const existing = items.find((item) => item.key === key);
      if (existing) {
        return items.map((item) => item.key === key ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...items, {
        key,
        productId: product.id,
        name: product.name,
        imageUrl: product.imageUrl,
        variant: selectedVariant,
        unitPrice: Number(product.price) + (selectedVariant?.priceDelta ?? 0),
        quantity: 1,
        note: '',
      }];
    });
    setCartOpen(true);
  };

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
  const activeLine = lineFromSlug(slug);

  return (
    <div className="site-shell">
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="De Big Tank home">
            <img className="brand-logo" src="/brand-logo.jpeg" alt="" />
            <span>
              <strong>De Big Tank</strong>
              <small>Restaurant · Bakery · Lounge</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            {nav.slice(1).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <Link href="/reserve" className="header-reserve">Reserve</Link>
            <button type="button" onClick={() => setCartOpen(true)} className="cart-button" aria-label={`Open cart with ${cartCount} items`}>
              Bag <span>{cartCount}</span>
            </button>
            <button type="button" className="menu-button" aria-label="Toggle menu" aria-expanded={mobileOpen} onClick={() => setMobileOpen((open) => !open)}>
              <span /><span /><span />
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {nav.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            <Link href="/reserve" className="mobile-reserve">Reserve a table</Link>
          </nav>
        )}
      </header>

      <main id="main-content">
        {slug === 'gallery' ? <Gallery images={content.gallery} /> :
          slug === 'about' ? <About /> :
          slug === 'promotions' ? <Promotions promotions={content.promotions} /> :
          slug === 'contact' ? <Contact settings={content.settings} /> :
          slug === 'reserve' ? <Reservation settings={content.settings} /> :
          activeLine ? <Catalog line={activeLine} products={content.products} categories={content.categories} add={addToCart} /> :
          <Home content={content} add={addToCart} />}
      </main>

      <Footer settings={content.settings} />
      {cartOpen && (
        <Cart
          items={cart}
          close={() => setCartOpen(false)}
          proceed={() => { setCartOpen(false); setCheckoutOpen(true); }}
          change={setCart}
        />
      )}
      {checkoutOpen && <Checkout items={cart} settings={content.settings} close={() => setCheckoutOpen(false)} />}
    </div>
  );
}

function Home({ content, add }: { content: Content; add: (product: Product, variant?: Variant) => void }) {
  const services = [
    { title: 'Restaurant', eyebrow: 'At the table', description: 'Generous Nigerian favourites, grills and plates built for sharing.', href: '/restaurant', image: fallbackProducts[0].imageUrl! },
    { title: 'Bakery', eyebrow: 'From the oven', description: 'Fresh pastries and celebration cakes made with a personal touch.', href: '/bakery', image: fallbackProducts[2].imageUrl! },
    { title: 'Lounge', eyebrow: 'After hours', description: 'Cocktails, shared plates and a room that settles into the evening.', href: '/lounge', image: fallbackProducts[4].imageUrl! },
  ];
  return (
    <>
      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">Restaurant · Bakery · Lounge</p>
          <h1>A little luxury.<br /><em>A lot of flavour.</em></h1>
          <p className="hero-copy">Bold Nigerian favourites, oven-fresh bakes and slow lounge evenings—all beautifully made, all under one roof.</p>
          <div className="hero-actions">
            <Link href="/restaurant" className="button primary">Order now</Link>
            <Link href="/reserve" className="button outline-dark">Reserve a table</Link>
          </div>
        </div>
        <div className="hero-visual">
          <img src={fallbackProducts[0].imageUrl!} alt="A vibrant plate from the De Big Tank kitchen" />
          <span className="hero-stamp">Made fresh<br />served beautifully</span>
        </div>
        <span className="doodle doodle-croissant" aria-hidden="true">🥐</span>
      </section>

      <section className="marquee" aria-label="De Big Tank offerings">
        <span>good food</span><b>✦</b><span>fresh bakes</span><b>✦</b><span>fine evenings</span><b>✦</b><span>beautiful moments</span>
      </section>

      <section className="service-gateways" aria-labelledby="service-heading">
        <div className="section-intro align-left">
          <p className="eyebrow">Whatever you came for</p>
          <h2 id="service-heading">There’s always something<br /><em>worth staying for.</em></h2>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <Link href={service.href} className="service-card" key={service.title}>
              <img src={service.image} alt="" />
              <span className="service-overlay">
                <small>{service.eyebrow}</small>
                <strong>{service.title}</strong>
                <span>{service.description}</span>
                <b>Explore {service.title} <span aria-hidden="true">→</span></b>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">From our menus</p>
            <h2>Made for the whole table</h2>
          </div>
          <Link href="/restaurant" className="text-link">Explore every menu <span aria-hidden="true">→</span></Link>
        </div>
        <div className="product-grid">
          {content.products.filter((product) => product.isAvailable).slice(0, 3).map((product) => <ProductTile key={product.id} product={product} add={add} />)}
        </div>
      </section>

      <section className="story-section">
        <div className="story-image"><img src="/lounge-interior.jpeg" alt="The warm, elegant lounge at De Big Tank" /></div>
        <div className="story-copy">
          <p className="eyebrow">Stay a little longer</p>
          <h2>Your new favourite place to <em>unwind.</em></h2>
          <p>Lunch that turns into dessert. A quick bakery stop that becomes a celebration order. Drinks that settle into a full evening. De Big Tank brings it all under one roof.</p>
          <Link href="/about" className="text-link">Our story <span aria-hidden="true">→</span></Link>
          <span className="script-note">stay awhile ♡</span>
        </div>
      </section>

      {content.promotions[0] && <PromoFeature promotion={content.promotions[0]} />}

      <section className="gallery-preview">
        <div className="section-heading-row">
          <div><p className="eyebrow">Inside De Big Tank</p><h2>A taste of the room</h2></div>
          <Link href="/gallery" className="text-link">View the gallery <span aria-hidden="true">→</span></Link>
        </div>
        <div className="gallery-strip">
          {content.gallery.slice(0, 4).map((item) => <img key={item.id} src={item.imageUrl} alt={item.altText} />)}
        </div>
      </section>

      <section className="closing-cta">
        <p className="eyebrow gold">Your table is waiting</p>
        <h2>Come hungry. Leave happy.</h2>
        <p>Tell us when you’re coming and our team will confirm the details with you directly on WhatsApp.</p>
        <Link href="/reserve" className="button gold-button">Reserve a table</Link>
      </section>
    </>
  );
}

function Catalog({ line, products, categories, add }: { line: Line; products: Product[]; categories: Category[]; add: (product: Product, variant?: Variant) => void }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const title = line.charAt(0) + line.slice(1).toLowerCase();
  const lineProducts = useMemo(() => products.filter((product) =>
    product.category.serviceLine === line &&
    (category === 'all' || product.category.slug === category) &&
    product.name.toLowerCase().includes(query.toLowerCase()),
  ), [products, line, category, query]);
  const lineCategories = categories.filter((item) => item.serviceLine === line);
  return (
    <div className="page-wrap">
      <PageHeader
        eyebrow={`De Big Tank ${title}`}
        title={line === 'LOUNGE' ? 'Good drinks. Better evenings.' : line === 'BAKERY' ? 'Fresh from our ovens.' : 'The table starts here.'}
        copy={line === 'LOUNGE' ? 'Cocktails, bottles and shared plates for unhurried nights.' : `Browse the ${title.toLowerCase()} menu, choose your favourites and send your order on WhatsApp.`}
      />
      <div className="catalog-tools">
        <label className="search-field">
          <span className="sr-only">Search the menu</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search this menu" />
        </label>
        <div className="category-tabs" aria-label="Filter by category">
          <button className={category === 'all' ? 'active' : ''} onClick={() => setCategory('all')}>All</button>
          {lineCategories.map((item) => <button className={category === item.slug ? 'active' : ''} key={item.id} onClick={() => setCategory(item.slug)}>{item.name}</button>)}
        </div>
      </div>
      {lineProducts.length ? (
        <div className="product-grid catalog-grid">
          {lineProducts.map((product) => <ProductTile key={product.id} product={product} add={add} />)}
        </div>
      ) : <div className="empty-state"><h2>No matches yet</h2><p>Try another search or category.</p></div>}
    </div>
  );
}

function ProductTile({ product, add }: { product: Product; add: (product: Product, variant?: Variant) => void }) {
  const availableVariants = product.variants.filter((variant) => variant.isAvailable);
  const [variantId, setVariantId] = useState(availableVariants[0]?.id ?? '');
  const variant = availableVariants.find((item) => item.id === variantId);
  const displayedPrice = Number(product.price) + Number(variant?.priceDelta ?? 0);
  const canAdd = product.isAvailable && (!product.variants.length || Boolean(variant));
  return (
    <article className={`product-card ${!product.isAvailable ? 'sold-out' : ''}`}>
      <div className="product-image-wrap">
        <img src={product.imageUrl ?? fallbackProducts[0].imageUrl!} alt={product.altText ?? product.name} />
        {!product.isAvailable && <span className="sold-out-badge">Sold out</span>}
      </div>
      <div className="product-body">
        <p className="eyebrow">{product.category.name}</p>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        {product.variants.length > 0 && (
          <label className="variant-select">
            <span>Choose an option</span>
            <select value={variantId} onChange={(event) => setVariantId(event.target.value)} disabled={!product.isAvailable}>
              {availableVariants.map((item) => <option key={item.id} value={item.id}>{item.name} · {naira(Number(product.price) + Number(item.priceDelta))}</option>)}
            </select>
          </label>
        )}
        <div className="product-footer">
          <strong>{naira(displayedPrice)}</strong>
          <button type="button" disabled={!canAdd} onClick={() => add(product, variant)}>
            {product.isAvailable ? 'Add to bag' : 'Unavailable'}
          </button>
        </div>
      </div>
    </article>
  );
}

function Gallery({ images }: { images: GalleryImage[] }) {
  const [selected, setSelected] = useState<GalleryImage | null>(null);
  return (
    <div className="page-wrap">
      <PageHeader eyebrow="Gallery" title="The room, the table, the moment." copy="A glimpse of what we make and the atmosphere we make it in." />
      <div className="gallery-grid">
        {images.map((item, index) => (
          <button type="button" key={item.id} className={index % 5 === 0 ? 'gallery-tall' : ''} onClick={() => setSelected(item)}>
            <img src={item.imageUrl} alt={item.altText} />
            {item.caption && <span>{item.caption}</span>}
          </button>
        ))}
      </div>
      {selected && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={selected.altText} onClick={() => setSelected(null)}>
          <button type="button" aria-label="Close image" onClick={() => setSelected(null)}>Close</button>
          <figure onClick={(event) => event.stopPropagation()}>
            <img src={selected.imageUrl} alt={selected.altText} />
            {selected.caption && <figcaption>{selected.caption}</figcaption>}
          </figure>
        </div>
      )}
    </div>
  );
}

function Promotions({ promotions }: { promotions: Promotion[] }) {
  return (
    <div className="page-wrap">
      <PageHeader eyebrow="Promotions" title="More reasons to gather." copy="Current offers and special moments from across the restaurant, bakery and lounge." />
      <div className="promotion-grid">
        {promotions.map((promotion) => (
          <article key={promotion.id} className="promotion-card">
            {promotion.imageUrl && <img src={promotion.imageUrl} alt="" />}
            <div><p className="eyebrow">Current special</p><h2>{promotion.title}</h2><p>{promotion.description}</p></div>
          </article>
        ))}
      </div>
    </div>
  );
}

function PromoFeature({ promotion }: { promotion: Promotion }) {
  return (
    <section className="promo-feature">
      <div className="promo-image">{promotion.imageUrl && <img src={promotion.imageUrl} alt="" />}</div>
      <div className="promo-copy"><p className="eyebrow gold">Now at De Big Tank</p><h2>{promotion.title}</h2><p>{promotion.description}</p><Link href="/promotions" className="button outline-light">See current specials</Link></div>
    </section>
  );
}

function About() {
  return (
    <div className="editorial-page">
      <PageHeader eyebrow="Our story" title="One house. Three reasons to stay." copy="De Big Tank brings generous dining, warm baking and effortless lounge evenings together under one roof." />
      <section className="editorial-split">
        <img src={fallbackProducts[0].imageUrl!} alt="A colourful meal prepared at De Big Tank" />
        <div><p className="eyebrow">Our table</p><h2>Hospitality without the fuss.</h2><p>We built De Big Tank around the way people actually gather: a quick meal can become a long conversation, a cake can carry a whole celebration, and the right room can change the pace of an evening.</p><p>Our approach is direct—cook generously, bake fresh, pour thoughtfully and make every guest feel expected.</p></div>
      </section>
      <section className="values-row">
        <div><span>01</span><h3>Generous by nature</h3><p>Plates, portions and service designed to make room for everyone.</p></div>
        <div><span>02</span><h3>Made with intention</h3><p>From daily bakes to after-hours cocktails, details matter.</p></div>
        <div><span>03</span><h3>Always welcoming</h3><p>A polished atmosphere that never feels stiff or distant.</p></div>
      </section>
    </div>
  );
}

function Contact({ settings }: { settings: SiteSettings }) {
  const hours = Object.entries(settings.businessHours ?? {});
  return (
    <div className="contact-page">
      <section>
        <p className="eyebrow">Contact</p>
        <h1>Come through.</h1>
        <p className="lead">Questions, orders and reservations are easiest on WhatsApp. Our team will take it from there.</p>
        <div className="contact-lines">
          <div><span>Call or WhatsApp</span><a href={`tel:${settings.phone ?? ''}`}>{settings.phone ?? 'To be confirmed'}</a></div>
          <div><span>Email</span><a href={`mailto:${settings.email ?? ''}`}>{settings.email ?? 'To be confirmed'}</a></div>
          <div><span>Find us</span><p>{settings.address ?? 'Address to be confirmed'}</p></div>
        </div>
        <a className="button primary" href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer">Chat on WhatsApp</a>
      </section>
      <section className="hours-panel">
        <p className="eyebrow gold">Opening hours</p>
        <h2>Plan your visit</h2>
        <dl>{hours.map(([day, time]) => <div key={day}><dt>{day}</dt><dd>{time}</dd></div>)}</dl>
      </section>
      <section className="map-panel">
        {settings.mapEmbedUrl ? <iframe src={settings.mapEmbedUrl} title="De Big Tank location" loading="lazy" /> : <div><p className="eyebrow">Location</p><h2>Map coming soon</h2><p>The exact address and map provider are awaiting final business confirmation.</p></div>}
      </section>
    </div>
  );
}

function Reservation({ settings }: { settings: SiteSettings }) {
  const today = new Date().toISOString().split('T')[0];
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      'Hello De Big Tank, I would like to request a reservation.',
      '',
      `Name: ${form.get('name')}`,
      `Phone: ${form.get('phone')}`,
      `Email: ${form.get('email') || 'Not provided'}`,
      `Date: ${form.get('date')}`,
      `Time: ${form.get('time')}`,
      `Guests: ${form.get('guests')}`,
      `Area: ${form.get('area')}`,
      `Special request: ${form.get('notes') || 'None'}`,
    ].join('\n');
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="form-page">
      <div className="form-intro"><p className="eyebrow">Reservations</p><h1>Save your seat.</h1><p>Your request opens in WhatsApp. Our team will confirm availability and the final details with you directly.</p></div>
      <form onSubmit={submit} className="reservation-form">
        <Field label="Name" name="name" required autoComplete="name" />
        <Field label="Phone" name="phone" required autoComplete="tel" inputMode="tel" pattern="[0-9+ ()-]{7,20}" />
        <Field label="Email (optional)" name="email" type="email" autoComplete="email" />
        <label><span>Area or type</span><select name="area"><option>Indoor</option><option>Lounge</option><option>VIP</option><option>Event</option></select></label>
        <Field label="Date" name="date" type="date" min={today} required />
        <Field label="Time" name="time" type="time" required />
        <Field label="Number of guests" name="guests" type="number" min="1" max="100" required />
        <label className="full"><span>Special request (optional)</span><textarea name="notes" rows={4} maxLength={500} /></label>
        <button className="button primary full" type="submit">Continue to WhatsApp</button>
        <p className="form-note full">Nothing is booked until our team confirms with you on WhatsApp.</p>
      </form>
    </div>
  );
}

function Cart({ items, close, proceed, change }: { items: CartItem[]; close: () => void; proceed: () => void; change: (items: CartItem[]) => void }) {
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={close}>
      <aside className="cart-drawer" role="dialog" aria-modal="true" aria-label="Your bag" onMouseDown={(event) => event.stopPropagation()}>
        <div className="drawer-header"><div><p className="eyebrow">Your order</p><h2>Your bag</h2></div><button onClick={close} aria-label="Close cart">Close</button></div>
        <div className="cart-items">
          {!items.length && <div className="empty-cart"><h3>Your bag is empty.</h3><p>Add something from one of our menus to begin.</p><button onClick={close}>Continue browsing</button></div>}
          {items.map((item) => (
            <div className="cart-item" key={item.key}>
              {item.imageUrl && <img src={item.imageUrl} alt="" />}
              <div className="cart-item-copy">
                <div className="cart-item-top"><div><strong>{item.name}</strong>{item.variant && <span>{item.variant.name}</span>}<b>{naira(item.unitPrice)}</b></div><button onClick={() => change(items.filter((entry) => entry.key !== item.key))}>Remove</button></div>
                <div className="quantity">
                  <button aria-label={`Decrease ${item.name} quantity`} onClick={() => change(items.map((entry) => entry.key === item.key ? { ...entry, quantity: Math.max(1, entry.quantity - 1) } : entry))}>−</button>
                  <span>{item.quantity}</span>
                  <button aria-label={`Increase ${item.name} quantity`} onClick={() => change(items.map((entry) => entry.key === item.key ? { ...entry, quantity: entry.quantity + 1 } : entry))}>+</button>
                </div>
                <label><span className="sr-only">Special request for {item.name}</span><input placeholder="Add a note" value={item.note} maxLength={240} onChange={(event) => change(items.map((entry) => entry.key === item.key ? { ...entry, note: event.target.value } : entry))} /></label>
              </div>
            </div>
          ))}
        </div>
        <div className="drawer-footer"><div><span>Estimated total</span><strong>{naira(total)}</strong></div><button disabled={!items.length} onClick={proceed}>Continue to order details</button><small>Final availability, delivery and payment are confirmed on WhatsApp.</small></div>
      </aside>
    </div>
  );
}

function Checkout({ items, settings, close }: { items: CartItem[]; settings: SiteSettings; close: () => void }) {
  const [orderType, setOrderType] = useState('Pickup');
  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!items.length) return;
    const form = new FormData(event.currentTarget);
    const itemLines = items.map((item) =>
      `- ${item.quantity}x ${item.name}${item.variant ? ` (${item.variant.name})` : ''}${item.note ? ` — ${item.note}` : ''}: ${naira(item.unitPrice * item.quantity)}`,
    );
    const message = [
      'Hello De Big Tank, I would like to place an order.',
      '',
      `Name: ${form.get('name')}`,
      `Phone: ${form.get('phone')}`,
      `Order type: ${orderType}`,
      `Preferred time: ${form.get('time') || 'Not specified'}`,
      `General notes: ${form.get('notes') || 'None'}`,
      '',
      'Items:',
      ...itemLines,
      '',
      `Estimated total: ${naira(total)}`,
    ].join('\n');
    window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="modal-backdrop" role="presentation">
      <div className="checkout-modal" role="dialog" aria-modal="true" aria-labelledby="checkout-title">
        <div className="drawer-header"><div><p className="eyebrow">Almost there</p><h2 id="checkout-title">Order details</h2></div><button onClick={close}>Close</button></div>
        {!items.length ? <div className="empty-cart"><h3>Your bag is empty.</h3><button onClick={close}>Go back</button></div> : (
          <form onSubmit={submit} className="checkout-form">
            <Field label="Name" name="name" required autoComplete="name" />
            <Field label="Phone" name="phone" required autoComplete="tel" inputMode="tel" pattern="[0-9+ ()-]{7,20}" />
            <fieldset className="order-type"><legend>Order type</legend><label><input type="radio" name="type" value="Pickup" checked={orderType === 'Pickup'} onChange={() => setOrderType('Pickup')} /> Pickup</label><label><input type="radio" name="type" value="Delivery" checked={orderType === 'Delivery'} onChange={() => setOrderType('Delivery')} /> Delivery</label></fieldset>
            {orderType === 'Pickup' && <Field label="Preferred pickup time (optional)" name="time" type="time" />}
            <label><span>General notes (optional)</span><textarea name="notes" rows={3} maxLength={500} /></label>
            <div className="checkout-summary"><span>{items.reduce((sum, item) => sum + item.quantity, 0)} items</span><strong>{naira(total)}</strong></div>
            <button className="button primary" type="submit">Open order in WhatsApp</button>
            <p className="form-note">You’ll review and send the message yourself. No order data is stored by this website.</p>
          </form>
        )}
      </div>
    </div>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label><span>{label}{props.required ? ' *' : ''}</span><input {...props} /></label>;
}

function PageHeader({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return <header className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p>{copy}</p></header>;
}

function Footer({ settings }: { settings: SiteSettings }) {
  const socialLinks = Object.entries(settings.socialLinks ?? {});
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div><span className="footer-brand">De Big Tank</span><p>{settings.tagline}</p></div>
        <div><h3>Explore</h3>{nav.slice(1, 5).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div><h3>Visit</h3><p>{settings.address}</p><a href={`tel:${settings.phone}`}>{settings.phone}</a></div>
        <div><h3>Talk to us</h3><a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp</a>{settings.email && <a href={`mailto:${settings.email}`}>{settings.email}</a>}{socialLinks.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer">{name}</a>)}</div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} De Big Tank</span><span>Restaurant · Bakery · Lounge</span></div>
    </footer>
  );
}
