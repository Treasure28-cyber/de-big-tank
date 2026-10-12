'use client';

import Link from 'next/link';
import type {} from 'react/canary';
import { FormEvent, ViewTransition, useEffect, useMemo, useRef, useState } from 'react';
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

export type PublicSlug = 'menu' | 'restaurant' | 'bakery' | 'lounge' | 'about' | 'contact' | 'reserve';
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
  ['Menu', '/menu'],
  ['About', '/about'],
  ['Contact', '/contact'],
] as const;
const serviceNav = [
  ['Restaurant', '/restaurant', 'Generous plates and local favourites'],
  ['Bakery', '/bakery', 'Fresh bakes and celebration cakes'],
  ['Lounge', '/lounge', 'Cocktails, shared plates and late nights'],
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
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const mobileNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('dbt-theme');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme);
      return;
    }
  }, []);

  const toggleTheme = () => setTheme((current) => {
    const next = current === 'light' ? 'dark' : 'light';
    window.localStorage.setItem('dbt-theme', next);
    return next;
  });

  useEffect(() => {
    if (!mobileOpen) return;
    mobileNavRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const keepFocus = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      const controls = [menuButtonRef.current, ...Array.from(mobileNavRef.current?.querySelectorAll<HTMLElement>('a, button, summary') ?? [])].filter((element): element is HTMLElement => Boolean(element && element.getClientRects().length));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    };
    document.addEventListener('keydown', keepFocus);
    return () => {
      document.removeEventListener('keydown', keepFocus);
      menuButtonRef.current?.focus();
    };
  }, [mobileOpen]);

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
    document.querySelectorAll<HTMLDetailsElement>('.service-menu[open]').forEach((menu) => menu.removeAttribute('open'));
  }, [slug]);

  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 1101px)');
    const closeOnDesktop = () => { if (desktop.matches) setMobileOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    return () => desktop.removeEventListener('change', closeOnDesktop);
  }, []);

  useEffect(() => {
    const overlayOpen = mobileOpen || cartOpen || checkoutOpen;
    const previousOverflow = document.body.style.overflow;
    if (overlayOpen) document.body.style.overflow = 'hidden';
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setMobileOpen(false);
      setCartOpen(false);
      setCheckoutOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [mobileOpen, cartOpen, checkoutOpen]);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealTargets = document.querySelectorAll<HTMLElement>([
      '#main-content .hero-content > *',
      '#main-content .section-intro',
      '#main-content .section-heading-row',
      '#main-content .service-card',
      '#main-content .product-card',
      '#main-content .story-image',
      '#main-content .story-copy > *',
      '#main-content .promo-image',
      '#main-content .promo-copy > *',
      '#main-content .gallery-strip img',
      '#main-content .closing-cta > *',
      '#main-content .menu-hero-copy > *',
      '#main-content .shared-page-hero > *',
      '#main-content .editorial-split > *',
      '#main-content .values-row > div',
      '#main-content .contact-page > section',
      '#main-content .form-page > *',
      '.site-footer .footer-main > div',
    ].join(','));

    revealTargets.forEach((element) => {
      element.classList.add('scroll-reveal');
      const siblings = element.parentElement ? Array.from(element.parentElement.children) : [];
      const position = Math.max(0, siblings.indexOf(element));
      element.style.setProperty('--reveal-delay', `${Math.min(position % 4, 3) * 80}ms`);
    });

    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealTargets.forEach((element) => element.classList.add('is-visible'));
      return;
    }

    document.documentElement.classList.add('motion-ready');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });

    revealTargets.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [slug, content.products, content.gallery, content.promotions]);

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
    <div className="site-shell" data-theme={theme}>
      <a href="#main-content" className="skip-link">Skip to content</a>
      <header className="site-header">
        <div className="header-inner">
          <Link href="/" className="brand" aria-label="De Big Tank home">
            <img className="brand-logo" src={theme === 'light' ? '/brand-logo-maroon.webp' : '/brand-logo-transparent.webp'} alt="" />
            <span>
              <strong>De Big Tank</strong>
              <small>Restaurant · Bakery · Lounge</small>
            </span>
          </Link>
          <nav className="desktop-nav" aria-label="Main navigation">
            <Link href="/">Home</Link>
            <details className={`service-menu ${activeLine ? 'active' : ''}`}>
              <summary>Services <span className="service-chevron" aria-hidden="true"><svg viewBox="0 0 12 8" focusable="false"><path d="m1 1.5 5 5 5-5" /></svg></span></summary>
              <div className="service-dropdown">
                <p>Choose an experience</p>
                {serviceNav.map(([label, href, copy]) => <Link key={href} href={href} onClick={(event) => event.currentTarget.closest('details')?.removeAttribute('open')}><strong>{label}</strong><small>{copy}</small></Link>)}
              </div>
            </details>
            {nav.slice(1).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
          <div className="header-actions">
            <button type="button" className="theme-toggle" onClick={toggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{theme === 'light' ? <path d="M20.5 13A8.5 8.5 0 0 1 11 3.5 8.5 8.5 0 1 0 20.5 13Z" /> : <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>}</svg>
            </button>
            <Link href="/reserve" className="header-reserve">Reserve</Link>
            <button type="button" onClick={() => setCartOpen(true)} className="cart-button" aria-label={`Open cart with ${cartCount} items`} title="Open cart">
              <span className="bag-icon" aria-hidden="true"><svg viewBox="0 0 24 24" focusable="false"><path d="M6.5 8.5h11l1 12h-13l1-12Z"/><path d="M9 9V6.5a3 3 0 0 1 6 0V9"/></svg></span>
              <span className="bag-count">{cartCount}</span>
            </button>
            <button ref={menuButtonRef} type="button" className="menu-button" aria-label={mobileOpen ? 'Close menu' : 'Open menu'} aria-expanded={mobileOpen} aria-controls="mobile-navigation" onClick={() => setMobileOpen((open) => !open)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d={mobileOpen ? 'm6 6 12 12M6 18 18 6' : 'M4 6h16M4 12h16M4 18h16'} /></svg>
            </button>
          </div>
        </div>
      </header>
        {mobileOpen && (
          <nav ref={mobileNavRef} id="mobile-navigation" className="mobile-nav" aria-label="Mobile navigation">
            <div className="mobile-nav-heading"><span>Explore De Big Tank</span><small>Restaurant · Bakery · Lounge</small></div>
            <Link href="/" onClick={() => setMobileOpen(false)}><small>01</small><span>Home</span></Link>
            <details className="service-menu mobile-service-menu">
              <summary><small>02</small><span>Services</span><b aria-hidden="true">+</b></summary>
              <div className="service-dropdown">
                {serviceNav.map(([label, href, copy]) => <Link key={href} href={href} onClick={() => setMobileOpen(false)}><strong>{label}</strong><small>{copy}</small></Link>)}
              </div>
            </details>
            {nav.slice(1).map(([label, href], index) => <Link key={href} href={href} onClick={() => setMobileOpen(false)}><small>{String(index + 3).padStart(2, '0')}</small><span>{label}</span></Link>)}
            <Link href="/reserve" className="mobile-reserve" onClick={() => setMobileOpen(false)}>Reserve a table</Link>
            <button type="button" className="mobile-theme-choice" onClick={toggleTheme}><span>Appearance</span><strong>{theme === 'light' ? 'Light' : 'Dark'} mode <span aria-hidden="true">↔</span></strong><small>Switch to {theme === 'light' ? 'dark' : 'light'}</small></button>
          </nav>
        )}

      <ViewTransition name="page-content" share="page-crossfade" enter="page-crossfade" exit="page-crossfade" default="none">
      <main id="main-content" key={slug ?? 'home'} inert={mobileOpen}>
        {slug === 'menu' ? <AllProducts products={content.products} add={addToCart} /> :
          slug === 'about' ? <About /> :
          slug === 'contact' ? <Contact settings={content.settings} /> :
          slug === 'reserve' ? <Reservation settings={content.settings} /> :
          activeLine ? <Catalog line={activeLine} products={content.products} categories={content.categories} add={addToCart} /> :
          <Home content={content} add={addToCart} />}
      </main>
      </ViewTransition>

      <div inert={mobileOpen}><Footer settings={content.settings} /></div>
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
    { number: '01', title: 'Restaurant', eyebrow: 'Eat generously', description: 'Nigerian favourites done properly. Fire-kissed grills, slow-cooked stews, rice the way it’s meant to taste and plates generous enough for the whole table.', href: '/restaurant', image: '/jollof-sharing-platter.jpg', action: 'See the food menu' },
    { number: '02', title: 'Bakery', eyebrow: 'Made fresh daily', description: 'Artisan breads, buttery pastries and celebration cakes built layer by layer. Whether you need something for the morning or something to mark the moment, it starts here.', href: '/bakery', image: '/artisan-bread.jpg', action: 'Visit the bakery' },
    { number: '03', title: 'Lounge', eyebrow: 'Stay after dark', description: 'Considered cocktails, shared plates and unhurried conversation. The kind of evening that earns its own story. Pull up a seat and let the night decide the rest.', href: '/lounge', image: '/lounge-interior.jpeg', action: 'Enter the lounge' },
  ];
  return (
    <>
      <section className="hero">
        <img className="home-hero-image" src="/menu-hero-v1.webp" alt="Jollof rice, grilled suya, fresh pastries and cocktails in a warmly lit lounge" fetchPriority="high" />
        <div className="hero-content">
          <p className="eyebrow"><span className="hero-status-dot" /> Warri, Delta State / Open daily</p>
          <h1>One house.<br /><em>Three moods.</em></h1>
          <p className="hero-copy">Restaurant. Bakery. Lounge. One address for every version of your day, from the first craving to the last round.</p>
          <div className="hero-actions">
            <Link href="#three-ways" className="button primary">Choose your mood <span aria-hidden="true">↓</span></Link>
            <Link href="/reserve" className="button outline-dark">Book a table</Link>
          </div>
          <div className="hero-experiences" aria-label="Explore our experiences">
            {serviceNav.map(([label, href], index) => <Link href={href} key={href}><small>0{index + 1}</small><span>{label}</span><b aria-hidden="true">↗</b></Link>)}
          </div>
        </div>
        <div className="hero-photo-caption"><span>Good food. Good company.</span><small>Make yourself at home.</small></div>
      </section>

      <section className="service-gateways" id="three-ways" aria-labelledby="service-heading">
        <div className="section-intro align-left">
          <p className="eyebrow">De Big Tank / Three ways in</p>
          <div className="service-intro-row">
            <h2 id="service-heading">Pick your<br /><em>kind of good.</em></h2>
            <p>Three distinct experiences. One unmistakably warm welcome. Start wherever the day finds you.</p>
          </div>
        </div>
        <div className="service-grid">
          {services.map((service) => (
            <Link href={service.href} className="service-card" key={service.title}>
              <span className="service-card-top"><small>{service.number} /</small><small>{service.eyebrow}</small></span>
              <span className="service-card-image"><img src={service.image} alt="" /></span>
              <span className="service-card-copy"><strong>{service.title}</strong><span>{service.description}</span></span>
              <b>{service.action} <span aria-hidden="true">→</span></b>
            </Link>
          ))}
        </div>
      </section>

      <section className="featured-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">From our menus</p>
            <h2>Made for the whole table.</h2>
          </div>
          <Link href="/menu" className="text-link">Explore every menu <span aria-hidden="true">→</span></Link>
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
          <p>Lunch that turns into dessert. A bakery stop that becomes a celebration order. Drinks that ease into a full evening. De Big Tank brings it all under one roof because the best days rarely stick to the plan.</p>
          <Link href="/about" className="text-link">Our story <span aria-hidden="true">→</span></Link>
          <span className="script-note">stay awhile ♡</span>
        </div>
      </section>

      {content.promotions[0] && <PromoFeature promotion={content.promotions[0]} />}

      <section className="gallery-preview">
        <div className="section-heading-row">
          <div><p className="eyebrow">Inside De Big Tank</p><h2>A taste of the room.</h2><p className="gallery-subline">Come for the food. Stay for everything else.</p></div>
        </div>
        <div className="gallery-strip">
          {content.gallery.slice(0, 4).map((item) => <img key={item.id} src={item.imageUrl} alt={item.altText} />)}
        </div>
      </section>

      <section className="closing-cta">
        <p className="eyebrow gold">Your table is waiting</p>
        <h2>Come hungry. Leave happy.</h2>
        <p>Tell us when you’re coming and our team will confirm the details with you directly on WhatsApp. Walk-ins welcome, reservations preferred.</p>
        <Link href="/reserve" className="button gold-button">Reserve a table</Link>
      </section>
    </>
  );
}

function AllProducts({ products, add }: { products: Product[]; add: (product: Product, variant?: Variant) => void }) {
  const groups: { line: Line; title: string; copy: string }[] = [
    { line: 'RESTAURANT', title: 'Restaurant menu', copy: 'Nigerian dishes, grills and generous plates prepared in Warri.' },
    { line: 'BAKERY', title: 'Bakery menu', copy: 'Pastries and celebration cakes baked for everyday treats and special occasions.' },
    { line: 'LOUNGE', title: 'Lounge menu', copy: 'Cocktails, zero-proof drinks and shared plates for relaxed evenings.' },
  ];
  return <div className="page-wrap all-products-page">
    <section className="all-menu-hero">
      <img src="/menu-hero-v1.webp" alt="A table of Nigerian dishes, fresh bakes, cake and cocktails inside the De Big Tank lounge" />
      <div className="all-menu-hero-content">
        <PageHeader eyebrow="All menus / De Big Tank" title="The full menu." copy="Restaurant favourites, fresh bakery treats and lounge selections—brought together in one easy place." />
      </div>
    </section>
    <nav className="menu-section-jump" aria-label="Menu sections">{groups.map((group) => <a key={group.line} href={`#products-${group.line.toLowerCase()}`}>{group.title}</a>)}</nav>
    {groups.map((group, index) => {
      const items = products.filter((product) => product.category.serviceLine === group.line);
      return <section className="all-products-group" key={group.line} aria-labelledby={`products-${group.line.toLowerCase()}`}>
        <div className="section-heading-row"><div><p className="eyebrow">{String(index + 1).padStart(2, '0')} / {group.line.toLowerCase()}</p><h2 id={`products-${group.line.toLowerCase()}`}>{group.title}</h2></div><p>{group.copy}</p></div>
        {items.length ? <div className="product-grid">{items.map((product) => <ProductTile key={product.id} product={product} add={add} />)}</div> : <p>No products are currently listed in this section.</p>}
      </section>;
    })}
  </div>;
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
  const hero = line === 'BAKERY' ? {
    kicker: 'Baked in Warri · Fresh every day',
    title: 'Warm from the oven. Made to share.',
    copy: 'Soft loaves, celebration cakes and buttery favourites, baked fresh for the moments that deserve something special.',
    image: '/bakery-hero-overlay.webp',
    alt: 'An abundant display of freshly baked breads and pastries',
    notes: ['Fresh daily', 'Custom cakes', 'Pickup available'],
  } : line === 'LOUNGE' ? {
    kicker: 'After dark at De Big Tank',
    title: 'Good drinks. Better evenings.',
    copy: 'Signature cocktails, chilled bottles and generous shared plates for nights that should never feel rushed.',
    image: '/lounge-interior.jpeg',
    alt: 'The warm and inviting De Big Tank lounge interior',
    notes: ['Signature cocktails', 'Shared plates', 'Open late'],
  } : {
    kicker: 'Nigerian flavour · Generously served',
    title: 'Tradition on every plate.',
    copy: 'Fire-kissed grills, rich local favourites and abundant plates prepared for gathering around the table.',
    image: '/restaurant-hero-overlay.webp',
    alt: 'The warmly lit De Big Tank restaurant dining room',
    notes: ['Made to order', 'Local favourites', 'Family portions'],
  };
  return (
    <>
    <div className="page-wrap">
      <section className={`menu-hero menu-hero-${line.toLowerCase()}`}>
        <img className="menu-hero-background" src={hero.image} alt={hero.alt} />
        <div className="menu-hero-copy">
          <p className="eyebrow">{hero.kicker}</p>
          <h1>{hero.title}</h1>
          <p className="menu-hero-lead">{hero.copy}</p>
          <div className="menu-hero-actions">
            <a href="#menu-list" className="button primary">Explore our Menu</a>
            <Link href="/reserve" className="button menu-hero-secondary">Book a table</Link>
          </div>
          <div className="menu-hero-notes" aria-label={`${title} highlights`}>
            {hero.notes.map((note) => <span key={note}>{note}</span>)}
          </div>
        </div>
        <span className="menu-hero-seal">De Big Tank<br />{title}</span>
      </section>
      <div className="catalog-tools" id="menu-list">
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
      {line === 'BAKERY' && <section className="bakery-photo-section" aria-labelledby="bakery-photo-heading">
        <div className="section-heading-row"><div><p className="eyebrow">From the bakery</p><h2 id="bakery-photo-heading">Fresh bakes. Sweet moments.</h2></div></div>
        <div className="bakery-photo-grid">{[
          ['/artisan-bread.jpg', 'Artisan bread', 'Sliced golden bread served with butter'],
          ['/banana-nut-bread.jpg', 'Banana nut bread', 'Banana bread topped with walnuts and chocolate chips'],
          ['/red-velvet-slice.jpg', 'Celebration layers', 'Red velvet cake layered with cream cheese frosting'],
        ].map(([src, caption, alt]) => <figure key={src}><img src={src} alt={alt} loading="lazy" /><figcaption>{caption}</figcaption></figure>)}</div>
      </section>}
    </>
  );
}

function ProductTile({ product, add }: { product: Product; add: (product: Product, variant?: Variant) => void }) {
  const availableVariants = product.variants.filter((variant) => variant.isAvailable);
  const [variantId, setVariantId] = useState(availableVariants[0]?.id ?? '');
  const variant = availableVariants.find((item) => item.id === variantId);
  const displayedPrice = Number(product.price) + Number(variant?.priceDelta ?? 0);
  const canAdd = product.isAvailable && (!product.variants.length || Boolean(variant));
  const useImageFallback = (image: HTMLImageElement) => {
    const fallback = product.category.serviceLine === 'BAKERY' && product.category.slug !== 'cakes' ? '/bakery-hero-bread.webp' : '/menu-hero-v1.webp';
    if (!image.src.endsWith(fallback)) {
      image.src = fallback;
      image.alt = `${product.category.serviceLine.toLowerCase()} selections at De Big Tank`;
    }
  };
  return (
    <article className={`product-card ${!product.isAvailable ? 'sold-out' : ''}`}>
      <div className="product-image-wrap">
        <img src={product.imageUrl ?? '/menu-hero-v1.webp'} alt={product.altText ?? product.name} ref={(image) => {
          if (image?.complete && image.naturalWidth === 0) useImageFallback(image);
        }} onError={(event) => useImageFallback(event.currentTarget)} />
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
            <span className="add-label">{product.isAvailable ? 'Add to bag' : 'Unavailable'}</span>
            <span className="add-icon" aria-hidden="true">{product.isAvailable ? '+' : '×'}</span>
          </button>
        </div>
      </div>
    </article>
  );
}

function PromoFeature({ promotion }: { promotion: Promotion }) {
  return (
    <section className="promo-feature">
      <div className="promo-image">{promotion.imageUrl && <img src={promotion.imageUrl} alt="" />}</div>
      <div className="promo-copy"><p className="eyebrow gold">{promotion.id === 'friday' || promotion.slug === 'friday-lounge-service' ? 'Every Friday from 6pm' : 'Now at De Big Tank'}</p><h2>{promotion.title}</h2><p>{promotion.description}</p><Link href="/contact" className="button outline-light">Ask about this offer</Link></div>
    </section>
  );
}

function SharedPageHero({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <section className="shared-page-hero">
      <img src="/shared-brand-hero.webp" alt="De Big Tank lounge and hospitality setting" />
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}

function About() {
  return (
    <div className="editorial-page shared-hero-page">
      <SharedPageHero eyebrow="Our story" title="One house. Three reasons to stay." copy="De Big Tank brings generous dining, warm baking and effortless lounge evenings together under one roof." />
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
        <div>
          <Link href="/" className="footer-logo-lockup" aria-label="De Big Tank home">
            <img src="/brand-logo-transparent.webp" alt="" />
            <span className="footer-brand">De Big Tank</span>
          </Link>
          <p>{settings.tagline}</p>
        </div>
        <div><h3>Explore</h3>{nav.slice(1, 5).map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}</div>
        <div><h3>Visit</h3><p>{settings.address}</p></div>
        <div><h3>Talk to us</h3><a href={`https://wa.me/${settings.whatsappNumber}`} target="_blank" rel="noreferrer">WhatsApp: {settings.phone ?? settings.whatsappNumber}</a>{settings.email && <a href={`mailto:${settings.email}`}>Email: {settings.email}</a>}{socialLinks.map(([name, href]) => <a key={name} href={href} target="_blank" rel="noreferrer">{name}</a>)}</div>
        <div><h3>Open daily</h3>{Object.entries(settings.businessHours ?? {}).map(([service, hours]) => <p key={service}>{service}: {hours}</p>)}</div>
      </div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} De Big Tank</span><span>Restaurant · Bakery · Lounge</span></div>
    </footer>
  );
}
