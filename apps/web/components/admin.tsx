'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';
type Tab = 'overview' | 'categories' | 'products' | 'gallery' | 'promotions' | 'settings';
type RecordValue = Record<string, unknown>;

export default function Admin() {
  const [token, setToken] = useState('');
  const [adminName, setAdminName] = useState('');
  const [tab, setTab] = useState<Tab>('overview');
  const [records, setRecords] = useState<RecordValue[]>([]);
  const [categories, setCategories] = useState<RecordValue[]>([]);
  const [settings, setSettings] = useState<RecordValue | null>(null);
  const [editing, setEditing] = useState<RecordValue | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setToken(window.sessionStorage.getItem('dbt-admin-token') ?? '');
    setAdminName(window.sessionStorage.getItem('dbt-admin-name') ?? '');
  }, []);

  const request = useCallback(async (path: string, options: RequestInit = {}) => {
    const response = await fetch(`${apiUrl}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });
    if (response.status === 401) {
      window.sessionStorage.removeItem('dbt-admin-token');
      setToken('');
      throw new Error('Your session expired. Please sign in again.');
    }
    const body = await response.json().catch(() => null) as RecordValue | null;
    if (!response.ok) {
      const detail = Array.isArray(body?.message) ? body.message.join(', ') : body?.message;
      throw new Error(typeof detail === 'string' ? detail : 'The request could not be completed.');
    }
    return body;
  }, [token]);

  const load = useCallback(async () => {
    if (!token || tab === 'overview') return;
    setLoading(true);
    setError('');
    try {
      if (tab === 'settings') {
        setSettings(await request('/settings'));
        setRecords([]);
      } else {
        const data = await request(`/admin/${tab}`);
        setRecords(Array.isArray(data) ? data : []);
        if (tab === 'products') {
          const categoryData = await request('/admin/categories');
          setCategories(Array.isArray(categoryData) ? categoryData : []);
        }
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load content.');
    } finally {
      setLoading(false);
    }
  }, [request, tab, token]);

  useEffect(() => {
    setEditing(null);
    void load();
  }, [load]);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch(`${apiUrl}/admin/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.get('email'), password: form.get('password') }),
      });
      const body = await response.json() as { accessToken?: string; admin?: { name?: string }; message?: string };
      if (!response.ok || !body.accessToken) throw new Error(body.message ?? 'Invalid email or password.');
      window.sessionStorage.setItem('dbt-admin-token', body.accessToken);
      window.sessionStorage.setItem('dbt-admin-name', body.admin?.name ?? 'Administrator');
      setToken(body.accessToken);
      setAdminName(body.admin?.name ?? 'Administrator');
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to sign in.');
    } finally {
      setLoading(false);
    }
  };

  const mutate = async (path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: RecordValue) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await request(path, { method, body: body ? JSON.stringify(body) : undefined });
      setMessage('Changes saved.');
      setEditing(null);
      await load();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to save changes.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <AdminLogin submit={login} loading={loading} error={error} />;

  const logout = () => {
    window.sessionStorage.removeItem('dbt-admin-token');
    window.sessionStorage.removeItem('dbt-admin-name');
    setToken('');
  };

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand"><span>BT</span><div><strong>De Big Tank</strong><small>Staff workspace</small></div></div>
        <nav>
          {([
            ['overview', 'Overview'],
            ['categories', 'Categories'],
            ['products', 'Menu items'],
            ['gallery', 'Gallery'],
            ['promotions', 'Promotions'],
            ['settings', 'Site settings'],
          ] as [Tab, string][]).map(([value, label]) => <button key={value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{label}</button>)}
        </nav>
        <button className="admin-logout" onClick={logout}>Sign out</button>
      </aside>
      <main className="admin-main">
        <header className="admin-topbar"><div><p>Staff workspace</p><h1>{tab === 'overview' ? `Welcome, ${adminName}` : tab === 'products' ? 'Menu items' : titleCase(tab)}</h1></div><a href="/" target="_blank" rel="noreferrer">View public site ↗</a></header>
        {message && <div className="admin-alert success">{message}</div>}
        {error && <div className="admin-alert error">{error}</div>}
        {loading && <div className="admin-loading">Working…</div>}
        {tab === 'overview' ? <AdminOverview setTab={setTab} /> :
          tab === 'categories' ? <CategoryManager records={records} editing={editing} setEditing={setEditing} mutate={mutate} /> :
          tab === 'products' ? <ProductManager records={records} categories={categories} editing={editing} setEditing={setEditing} mutate={mutate} /> :
          tab === 'gallery' ? <GalleryManager records={records} editing={editing} setEditing={setEditing} mutate={mutate} /> :
          tab === 'promotions' ? <PromotionManager records={records} editing={editing} setEditing={setEditing} mutate={mutate} /> :
          <SettingsManager settings={settings} mutate={mutate} />}
      </main>
    </div>
  );
}

function AdminLogin({ submit, loading, error }: { submit: (event: FormEvent<HTMLFormElement>) => void; loading: boolean; error: string }) {
  return (
    <main className="admin-login">
      <section className="admin-login-brand"><div><span className="admin-login-mark">BT</span><p>De Big Tank</p><h1>Everything guests see, managed in one place.</h1><small>Restaurant · Bakery · Lounge</small></div></section>
      <section className="admin-login-form"><form onSubmit={submit}><p className="eyebrow">Staff only</p><h2>Welcome back</h2><p>Sign in to manage menus, images, promotions and business information.</p>{error && <div className="admin-alert error">{error}</div>}<label><span>Email</span><input name="email" type="email" required autoComplete="username" /></label><label><span>Password</span><input name="password" type="password" required minLength={8} autoComplete="current-password" /></label><button disabled={loading}>{loading ? 'Signing in…' : 'Sign in'}</button><a href="/">← Return to public site</a></form></section>
    </main>
  );
}

function AdminOverview({ setTab }: { setTab: (tab: Tab) => void }) {
  const items: [Tab, string, string][] = [
    ['products', 'Menu items', 'Manage dishes, drinks, bakery items, pricing and availability.'],
    ['categories', 'Categories', 'Organise every item across the three service lines.'],
    ['gallery', 'Gallery', 'Keep the public gallery fresh and relevant.'],
    ['promotions', 'Promotions', 'Schedule and update current guest offers.'],
    ['settings', 'Site settings', 'Update contact details, hours and homepage content.'],
  ];
  return <div className="admin-overview"><div className="admin-welcome"><p className="eyebrow">Content control</p><h2>Keep the whole house current.</h2><p>Changes here flow directly to the public website. Orders and reservations remain in WhatsApp and are never stored here.</p></div><div className="admin-action-grid">{items.map(([tab, title, copy]) => <button key={tab} onClick={() => setTab(tab)}><span>Manage</span><strong>{title}</strong><p>{copy}</p><b>Open section →</b></button>)}</div></div>;
}

type ManagerProps = {
  records: RecordValue[];
  editing: RecordValue | null;
  setEditing: (record: RecordValue | null) => void;
  mutate: (path: string, method: 'POST' | 'PATCH' | 'DELETE', body?: RecordValue) => Promise<void>;
};

function CategoryManager({ records, editing, setEditing, mutate }: ManagerProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = { name: form.get('name'), slug: form.get('slug'), serviceLine: form.get('serviceLine'), description: form.get('description'), sortOrder: Number(form.get('sortOrder') || 0), isActive: form.get('isActive') === 'on' };
    void mutate(editing ? `/admin/categories/${editing.id}` : '/admin/categories', editing ? 'PATCH' : 'POST', body);
  };
  return <ManagerLayout title={editing ? 'Edit category' : 'Add category'} form={<form key={String(editing?.id ?? 'new')} onSubmit={submit} className="admin-form"><AdminField name="name" label="Name" defaultValue={editing?.name} required /><AdminField name="slug" label="Slug" defaultValue={editing?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><label><span>Service line</span><select name="serviceLine" defaultValue={String(editing?.serviceLine ?? 'RESTAURANT')}><option>RESTAURANT</option><option>BAKERY</option><option>LOUNGE</option></select></label><AdminField name="sortOrder" label="Display order" type="number" min="0" defaultValue={editing?.sortOrder ?? 0} /><label className="wide"><span>Description</span><textarea name="description" defaultValue={String(editing?.description ?? '')} /></label><Check name="isActive" label="Visible on the website" defaultChecked={editing ? Boolean(editing.isActive) : true} /><FormButtons editing={editing} cancel={() => setEditing(null)} /></form>} list={<AdminTable headers={['Category', 'Line', 'Status', 'Items', 'Actions']} rows={records.map((record) => [String(record.name), String(record.serviceLine), Boolean(record.isActive) ? 'Active' : 'Hidden', String((record._count as RecordValue | undefined)?.products ?? 0), <RowActions key={String(record.id)} edit={() => setEditing(record)} toggle={() => mutate(`/admin/categories/${record.id}`, 'PATCH', { isActive: !record.isActive })} remove={() => confirmDelete(() => mutate(`/admin/categories/${record.id}`, 'DELETE'))} active={Boolean(record.isActive)} />])} />} />;
}

function ProductManager({ records, categories, editing, setEditing, mutate }: ManagerProps & { categories: RecordValue[] }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const variants = String(form.get('variants') ?? '').split('\n').map((line) => line.trim()).filter(Boolean).map((line, index) => {
      const [name, delta = '0'] = line.split(':');
      return { name: name.trim(), priceDelta: Number(delta.trim()), isAvailable: true, sortOrder: index };
    });
    const body = { name: form.get('name'), slug: form.get('slug'), description: form.get('description'), price: Number(form.get('price')), categoryId: form.get('categoryId'), imageUrl: form.get('imageUrl') || undefined, altText: form.get('altText') || undefined, isAvailable: form.get('isAvailable') === 'on', allowsSpecialNotes: form.get('allowsSpecialNotes') === 'on', variants };
    void mutate(editing ? `/admin/products/${editing.id}` : '/admin/products', editing ? 'PATCH' : 'POST', body);
  };
  const variantText = Array.isArray(editing?.variants) ? (editing.variants as RecordValue[]).map((variant) => `${variant.name}:${variant.priceDelta}`).join('\n') : '';
  return <ManagerLayout title={editing ? 'Edit menu item' : 'Add menu item'} form={<form key={String(editing?.id ?? 'new')} onSubmit={submit} className="admin-form"><AdminField name="name" label="Name" defaultValue={editing?.name} required /><AdminField name="slug" label="Slug" defaultValue={editing?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><AdminField name="price" label="Base price (₦)" type="number" min="0" step="0.01" defaultValue={editing?.price} required /><label><span>Category</span><select name="categoryId" defaultValue={String(editing?.categoryId ?? '')} required><option value="">Choose category</option>{categories.map((category) => <option key={String(category.id)} value={String(category.id)}>{String(category.serviceLine)} · {String(category.name)}</option>)}</select></label><label className="wide"><span>Description</span><textarea name="description" defaultValue={String(editing?.description ?? '')} required /></label><AdminField name="imageUrl" label="Image URL" type="url" defaultValue={editing?.imageUrl} /><AdminField name="altText" label="Image description" defaultValue={editing?.altText} /><label className="wide"><span>Variants — one per line as Name:Price adjustment</span><textarea name="variants" defaultValue={variantText} placeholder={'8 inch:0\n10 inch:6500'} /></label><Check name="isAvailable" label="Available to order" defaultChecked={editing ? Boolean(editing.isAvailable) : true} /><Check name="allowsSpecialNotes" label="Encourage special notes" defaultChecked={Boolean(editing?.allowsSpecialNotes)} /><FormButtons editing={editing} cancel={() => setEditing(null)} /></form>} list={<AdminTable headers={['Item', 'Category', 'Price', 'Status', 'Actions']} rows={records.map((record) => [String(record.name), String((record.category as RecordValue)?.name ?? ''), `₦${Number(record.price).toLocaleString('en-NG')}`, Boolean(record.isAvailable) ? 'Available' : 'Sold out', <RowActions key={String(record.id)} edit={() => setEditing(record)} toggle={() => mutate(`/admin/products/${record.id}`, 'PATCH', { isAvailable: !record.isAvailable })} remove={() => confirmDelete(() => mutate(`/admin/products/${record.id}`, 'DELETE'))} active={Boolean(record.isAvailable)} />])} />} />;
}

function GalleryManager({ records, editing, setEditing, mutate }: ManagerProps) {
  const [uploadedUrl, setUploadedUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  useEffect(() => {
    setUploadedUrl(String(editing?.imageUrl ?? ''));
    setUploadError('');
  }, [editing]);
  const upload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    setUploadError('');
    const body = new FormData();
    body.append('file', file);
    try {
      const response = await fetch(`${apiUrl}/admin/media/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${window.sessionStorage.getItem('dbt-admin-token') ?? ''}` },
        body,
      });
      const result = await response.json() as { imageUrl?: string; message?: string };
      if (!response.ok || !result.imageUrl) throw new Error(result.message ?? 'Upload failed.');
      setUploadedUrl(result.imageUrl);
    } catch (caught) {
      setUploadError(caught instanceof Error ? caught.message : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = { imageUrl: form.get('imageUrl'), altText: form.get('altText'), caption: form.get('caption'), sortOrder: Number(form.get('sortOrder') || 0), isActive: form.get('isActive') === 'on' };
    void mutate(editing ? `/admin/gallery/${editing.id}` : '/admin/gallery', editing ? 'PATCH' : 'POST', body);
  };
  return <ManagerLayout title={editing ? 'Edit gallery image' : 'Add gallery image'} note="Upload an image through Cloudinary, or paste an existing hosted image URL." form={<form key={String(editing?.id ?? 'new')} onSubmit={submit} className="admin-form"><label className="wide"><span>Upload image</span><input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void upload(event.target.files?.[0])} />{uploading && <small>Uploading…</small>}{uploadError && <small className="field-error">{uploadError}</small>}</label><label className="wide"><span>Image URL</span><input name="imageUrl" type="url" value={uploadedUrl} onChange={(event) => setUploadedUrl(event.target.value)} required /></label><AdminField name="altText" label="Accessible image description" defaultValue={editing?.altText} required /><AdminField name="caption" label="Caption" defaultValue={editing?.caption} /><AdminField name="sortOrder" label="Display order" type="number" min="0" defaultValue={editing?.sortOrder ?? 0} /><Check name="isActive" label="Visible in gallery" defaultChecked={editing ? Boolean(editing.isActive) : true} /><FormButtons editing={editing} cancel={() => setEditing(null)} /></form>} list={<div className="admin-gallery-list">{records.map((record) => <article key={String(record.id)}>{record.imageUrl ? <img src={String(record.imageUrl)} alt={String(record.altText ?? '')} /> : <div /> }<strong>{String(record.caption || record.altText)}</strong><RowActions edit={() => setEditing(record)} toggle={() => mutate(`/admin/gallery/${record.id}`, 'PATCH', { isActive: !record.isActive })} remove={() => confirmDelete(() => mutate(`/admin/gallery/${record.id}`, 'DELETE'))} active={Boolean(record.isActive)} /></article>)}</div>} />;
}

function PromotionManager({ records, editing, setEditing, mutate }: ManagerProps) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const body = { title: form.get('title'), slug: form.get('slug'), description: form.get('description'), imageUrl: form.get('imageUrl') || undefined, startsAt: form.get('startsAt') ? new Date(String(form.get('startsAt'))).toISOString() : undefined, endsAt: form.get('endsAt') ? new Date(String(form.get('endsAt'))).toISOString() : undefined, isActive: form.get('isActive') === 'on' };
    void mutate(editing ? `/admin/promotions/${editing.id}` : '/admin/promotions', editing ? 'PATCH' : 'POST', body);
  };
  const dateValue = (value: unknown) => typeof value === 'string' ? value.slice(0, 10) : '';
  return <ManagerLayout title={editing ? 'Edit promotion' : 'Add promotion'} form={<form key={String(editing?.id ?? 'new')} onSubmit={submit} className="admin-form"><AdminField name="title" label="Title" defaultValue={editing?.title} required /><AdminField name="slug" label="Slug" defaultValue={editing?.slug} required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" /><label className="wide"><span>Description</span><textarea name="description" defaultValue={String(editing?.description ?? '')} required /></label><AdminField name="imageUrl" label="Image URL" type="url" defaultValue={editing?.imageUrl} /><AdminField name="startsAt" label="Starts" type="date" defaultValue={dateValue(editing?.startsAt)} /><AdminField name="endsAt" label="Ends" type="date" defaultValue={dateValue(editing?.endsAt)} /><Check name="isActive" label="Promotion active" defaultChecked={editing ? Boolean(editing.isActive) : true} /><FormButtons editing={editing} cancel={() => setEditing(null)} /></form>} list={<AdminTable headers={['Promotion', 'Starts', 'Ends', 'Status', 'Actions']} rows={records.map((record) => [String(record.title), dateValue(record.startsAt) || 'Immediately', dateValue(record.endsAt) || 'No end date', Boolean(record.isActive) ? 'Active' : 'Paused', <RowActions key={String(record.id)} edit={() => setEditing(record)} toggle={() => mutate(`/admin/promotions/${record.id}`, 'PATCH', { isActive: !record.isActive })} remove={() => confirmDelete(() => mutate(`/admin/promotions/${record.id}`, 'DELETE'))} active={Boolean(record.isActive)} />])} />} />;
}

function SettingsManager({ settings, mutate }: { settings: RecordValue | null; mutate: ManagerProps['mutate'] }) {
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    let businessHours: Record<string, string> = {};
    let socialLinks: Record<string, string> = {};
    try { businessHours = JSON.parse(String(form.get('businessHours') || '{}')); } catch { alert('Business hours must be valid JSON.'); return; }
    try { socialLinks = JSON.parse(String(form.get('socialLinks') || '{}')); } catch { alert('Social links must be valid JSON.'); return; }
    const body = Object.fromEntries(['whatsappNumber','businessName','tagline','phone','email','address','mapEmbedUrl','heroTitle','heroSubtitle','heroImageUrl','heroImageAlt'].map((key) => [key, form.get(key) || undefined]));
    void mutate('/admin/settings', 'PATCH', { ...body, businessHours, socialLinks });
  };
  return <section className="admin-section"><div className="admin-form-panel settings-panel"><h2>Public business information</h2><p>These details power the public contact, footer, hero and WhatsApp handoff.</p><form key={JSON.stringify(settings)} onSubmit={submit} className="admin-form"><AdminField name="businessName" label="Business name" defaultValue={settings?.businessName ?? 'De Big Tank'} /><AdminField name="tagline" label="Tagline" defaultValue={settings?.tagline} /><AdminField name="whatsappNumber" label="WhatsApp number (digits only)" defaultValue={settings?.whatsappNumber} pattern="[0-9]{7,15}" required /><AdminField name="phone" label="Display phone" defaultValue={settings?.phone} /><AdminField name="email" label="Email" type="email" defaultValue={settings?.email} /><AdminField name="address" label="Address" defaultValue={settings?.address} /><AdminField name="mapEmbedUrl" label="Map embed URL" type="url" defaultValue={settings?.mapEmbedUrl} /><AdminField name="heroTitle" label="Homepage hero title" defaultValue={settings?.heroTitle} /><label className="wide"><span>Homepage hero description</span><textarea name="heroSubtitle" defaultValue={String(settings?.heroSubtitle ?? '')} /></label><AdminField name="heroImageUrl" label="Homepage hero image URL" type="url" defaultValue={settings?.heroImageUrl} /><AdminField name="heroImageAlt" label="Homepage hero image description" defaultValue={settings?.heroImageAlt} /><label className="wide"><span>Business hours (JSON object)</span><textarea name="businessHours" defaultValue={JSON.stringify(settings?.businessHours ?? {}, null, 2)} rows={8} /></label><label className="wide"><span>Social links (JSON object)</span><textarea name="socialLinks" defaultValue={JSON.stringify(settings?.socialLinks ?? {}, null, 2)} rows={5} /></label><div className="admin-form-actions wide"><button type="submit">Save settings</button></div></form></div></section>;
}

function ManagerLayout({ title, note, form, list }: { title: string; note?: string; form: React.ReactNode; list: React.ReactNode }) {
  return <section className="admin-section"><div className="admin-form-panel"><h2>{title}</h2>{note && <p>{note}</p>}{form}</div><div className="admin-list-panel"><h2>Current content</h2>{list}</div></section>;
}

function AdminField({ label, defaultValue, ...props }: { label: string; defaultValue?: unknown } & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'defaultValue'>) {
  return <label><span>{label}</span><input defaultValue={defaultValue == null ? '' : String(defaultValue)} {...props} /></label>;
}
function Check({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return <label className="admin-check"><input type="checkbox" {...props} /><span>{label}</span></label>;
}
function FormButtons({ editing, cancel }: { editing: RecordValue | null; cancel: () => void }) {
  return <div className="admin-form-actions wide"><button type="submit">{editing ? 'Save changes' : 'Add new'}</button>{editing && <button type="button" className="secondary" onClick={cancel}>Cancel</button>}</div>;
}
function RowActions({ edit, toggle, remove, active }: { edit: () => void; toggle: () => void; remove: () => void; active: boolean }) {
  return <div className="row-actions"><button onClick={edit}>Edit</button><button onClick={toggle}>{active ? 'Hide' : 'Show'}</button><button className="danger" onClick={remove}>Delete</button></div>;
}
function AdminTable({ headers, rows }: { headers: string[]; rows: React.ReactNode[][] }) {
  return <div className="admin-table-wrap"><table className="admin-table"><thead><tr>{headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>;
}
function confirmDelete(action: () => void) {
  if (window.confirm('Delete this content permanently? This cannot be undone.')) action();
}
function titleCase(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
