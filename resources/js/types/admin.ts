export type Bilingual = { ar: string; en: string };

export type Option = { value: string; label: string };

/** Inertia validation errors, keyed by dotted field path (`title.ar`). */
export type FormErrors = Record<string, string | undefined>;

export type MediaItem = {
    id: number;
    url: string;
    thumb: string;
    alt: Partial<Bilingual> | null;
    collection: string;
};

export type MediaModel = 'product' | 'design' | 'page' | 'article';

export type OrderRow = {
    id: number;
    code: string;
    created_at: string | null;
    customer_name: string;
    phone: string;
    governorate: string;
    design: string | null;
    quantity: number | null;
    status: string;
    status_label: string;
    payment_method: string;
    payment_method_label: string;
    payment_status: string;
    payment_status_label: string;
    total_label: string;
    flagged: boolean;
    source: string | null;
    url: string;
};

export type SeoData = {
    meta_title: Bilingual;
    meta_description: Bilingual;
    canonical_url: string;
    noindex: boolean;
};
