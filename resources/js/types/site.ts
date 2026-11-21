export type Locale = 'ar' | 'en';

export type Image = {
    id: number;
    src: string;
    webp: string | null;
    avif: string | null;
    width: number | null;
    height: number | null;
    alt: string;
};

export type Design = {
    id: number;
    key: string;
    name: string;
    names: { ar: string; en: string };
    motif: string | null;
    tint: string;
    stock: number;
    sold_out: boolean;
    url: string | null;
    cover: Image | null;
    images: Image[];
};

export type Product = {
    name: string;
    tagline: string;
    description: string;
    contents: { title: string; detail: string }[];
    specs: { label: string; value: string }[];
    price: number;
    price_label: string;
    instapay_price: number;
    instapay_label: string;
    saving: number;
    saving_label: string;
    discount_percent: number;
    sold_out: boolean;
    hero: Image | null;
    gallery: Image[];
    unboxing: Image[];
    url: string;
    checkout_url: string;
};

export type Faq = { id: number; question: string; answer: string };

export type Review = {
    id: number;
    name: string;
    rating: number;
    body: string;
    date: string | null;
};

export type ArticleCard = {
    title: string;
    excerpt: string | null;
    url: string;
    author: string | null;
    reading_minutes: number;
    published_at: string | null;
    published_label: string | null;
    category: { name: string; url: string } | null;
    cover: Image | null;
};

export type Seo = {
    title: string;
    description: string | null;
    canonical: string;
    alternates: Record<string, string>;
    image: string | null;
    noindex: boolean;
    type: string;
    schema: unknown[];
};

export type TrackingConfig = {
    ga4?: string;
    metaPixel?: string;
    posthogKey?: string;
    posthogHost?: string;
    tiktok?: string;
};

export type SiteChrome = {
    home: string;
    product: string;
    journal: string;
    checkout: string;
    faculties: { name: string; url: string }[];
    pages: { key: string | null; title: string; url: string }[];
    whatsapp: string | null;
    email: string | null;
    social: Partial<Record<'instagram' | 'facebook' | 'tiktok', string>>;
    tracking: TrackingConfig;
    turnstileSiteKey: string | null;
};

export type Messages = { [key: string]: string | Messages };
