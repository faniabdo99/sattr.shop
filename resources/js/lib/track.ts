import type { TrackingConfig } from '@/types/site';

/**
 * One tracking API for the whole storefront.
 *
 *   track('view_item', { value: 849, items: [...] })
 *
 * Providers load only when their ID is configured AND the visitor has
 * accepted marketing cookies. Events fired before that are held in memory
 * and replayed once consent is given on the same page.
 */

export type TrackEvent =
    | 'page_view'
    | 'view_item'
    | 'select_design'
    | 'begin_checkout'
    | 'add_payment_info'
    | 'purchase';

export type TrackItem = {
    item_id: string;
    item_name: string;
    item_variant?: string;
    price: number;
    quantity: number;
};

export type TrackPayload = {
    event_id?: string;
    currency?: 'EGP';
    value?: number;
    items?: TrackItem[];
    payment_type?: string;
    transaction_id?: string;
    design?: string;
    page_location?: string;
    page_title?: string;
};

export type Consent = 'granted' | 'denied' | null;

const CONSENT_COOKIE = 'sattr_consent';
const ATTRIBUTION_COOKIE = 'sattr_attribution';
const ATTRIBUTION_KEYS = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
    'gclid',
    'fbclid',
    'ttclid',
] as const;

type Queued = { event: TrackEvent; payload: TrackPayload };

declare global {
    interface Window {
        dataLayer?: unknown[];
        gtag?: (...args: unknown[]) => void;
        fbq?: ((...args: unknown[]) => void) & {
            queue?: unknown[];
            loaded?: boolean;
            version?: string;
            callMethod?: (...args: unknown[]) => void;
            push?: unknown;
        };
        _fbq?: unknown;
        ttq?: {
            load: (id: string) => void;
            page: () => void;
            track: (event: string, data?: unknown, options?: unknown) => void;
            [key: string]: unknown;
        };
        TiktokAnalyticsObject?: string;
    }
}

let config: TrackingConfig = {};
let loaded = false;
let queue: Queued[] = [];
let posthog: typeof import('posthog-js').default | null = null;

const isBrowser = typeof window !== 'undefined';

function readCookie(name: string): string | null {
    if (!isBrowser) {
        return null;
    }

    const match = document.cookie
        .split('; ')
        .find((row) => row.startsWith(`${name}=`));

    return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
}

function writeCookie(name: string, value: string, days: number): void {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();

    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function script(src: string): void {
    const element = document.createElement('script');

    element.async = true;
    element.src = src;
    document.head.appendChild(element);
}

export function newEventId(): string {
    return isBrowser && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function hasProviders(tracking: TrackingConfig): boolean {
    return Boolean(
        tracking.ga4 ||
        tracking.gtm ||
        tracking.metaPixel ||
        tracking.posthogKey ||
        tracking.tiktok,
    );
}

export function getConsent(): Consent {
    const value = readCookie(CONSENT_COOKIE);

    return value === 'granted' || value === 'denied' ? value : null;
}

export function setConsent(value: 'granted' | 'denied'): void {
    writeCookie(CONSENT_COOKIE, value, 180);

    if (value === 'granted') {
        loadProviders();
    } else {
        queue = [];
    }
}

/**
 * Remember where the visitor came from (UTM tags, ad click IDs, referrer)
 * in a first-party cookie. The server reads it when an order is placed.
 */
export function captureAttribution(): void {
    if (!isBrowser) {
        return;
    }

    const params = new URLSearchParams(window.location.search);
    const found: Record<string, string> = {};

    for (const key of ATTRIBUTION_KEYS) {
        const value = params.get(key);

        if (value) {
            found[key] = value.slice(0, 200);
        }
    }

    const existing = readCookie(ATTRIBUTION_COOKIE);

    if (Object.keys(found).length === 0 && existing) {
        return;
    }

    const external =
        document.referrer &&
        !document.referrer.startsWith(window.location.origin)
            ? document.referrer.slice(0, 400)
            : '';

    writeCookie(
        ATTRIBUTION_COOKIE,
        JSON.stringify({
            ...found,
            referrer: external,
            landing_page: window.location.pathname.slice(0, 400),
        }),
        90,
    );
}

export function initTracking(tracking: TrackingConfig): void {
    config = tracking;

    if (isBrowser && getConsent() === 'granted') {
        loadProviders();
    }
}

function loadProviders(): void {
    if (loaded || !isBrowser || !hasProviders(config)) {
        return;
    }

    loaded = true;

    if (config.ga4 || config.gtm) {
        const dataLayer = (window.dataLayer = window.dataLayer || []);

        // Google's tags only read the `arguments` object, never a plain array.
        window.gtag = function gtag() {
            dataLayer.push(arguments);
        };
        // Consent Mode v2: everything denied by default, then updated.
        window.gtag('consent', 'default', {
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            analytics_storage: 'denied',
        });
        window.gtag('consent', 'update', {
            ad_storage: 'granted',
            ad_user_data: 'granted',
            ad_personalization: 'granted',
            analytics_storage: 'granted',
        });
        window.gtag('js', new Date());

        if (config.ga4) {
            window.gtag('config', config.ga4, { send_page_view: false });
            script(`https://www.googletagmanager.com/gtag/js?id=${config.ga4}`);
        }

        if (config.gtm) {
            dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
            script(`https://www.googletagmanager.com/gtm.js?id=${config.gtm}`);
        }
    }

    if (config.metaPixel) {
        const fbq = function (...args: unknown[]) {
            if (fbq.callMethod) {
                fbq.callMethod(...args);
            } else {
                fbq.queue!.push(args);
            }
        } as NonNullable<Window['fbq']>;

        fbq.push = fbq;
        fbq.loaded = true;
        fbq.version = '2.0';
        fbq.queue = [];
        window.fbq = fbq;
        window._fbq = fbq;
        script('https://connect.facebook.net/en_US/fbevents.js');
        fbq('consent', 'grant');
        fbq('init', config.metaPixel);
    }

    if (config.tiktok) {
        const methods = ['page', 'track', 'identify', 'load'];
        const calls: unknown[][] = [];
        const ttq = { _calls: calls } as unknown as NonNullable<Window['ttq']>;

        for (const method of methods) {
            (ttq as Record<string, unknown>)[method] = (...args: unknown[]) =>
                calls.push([method, ...args]);
        }

        window.TiktokAnalyticsObject = 'ttq';
        window.ttq = window.ttq || ttq;
        script(
            `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${config.tiktok}&lib=ttq`,
        );
    }

    if (config.posthogKey) {
        void import('posthog-js').then((module) => {
            posthog = module.default;
            posthog.init(config.posthogKey!, {
                api_host: config.posthogHost,
                capture_pageview: false,
                persistence: 'localStorage+cookie',
            });
            flush();
        });
    }

    flush();
}

function flush(): void {
    const pending = queue;

    queue = [];
    pending.forEach(({ event, payload }) => dispatch(event, payload));
}

const META_EVENTS: Record<TrackEvent, string> = {
    page_view: 'PageView',
    view_item: 'ViewContent',
    select_design: 'CustomizeProduct',
    begin_checkout: 'InitiateCheckout',
    add_payment_info: 'AddPaymentInfo',
    purchase: 'Purchase',
};

const TIKTOK_EVENTS: Partial<Record<TrackEvent, string>> = {
    view_item: 'ViewContent',
    select_design: 'ClickButton',
    begin_checkout: 'InitiateCheckout',
    add_payment_info: 'AddPaymentInfo',
    purchase: 'PlaceAnOrder',
};

function dispatch(event: TrackEvent, payload: TrackPayload): void {
    const contents = (payload.items ?? []).map((item) => ({
        id: item.item_id,
        quantity: item.quantity,
        item_price: item.price,
    }));

    if (config.ga4 && window.gtag) {
        window.gtag('event', event, payload);
    }

    if (config.gtm && window.dataLayer) {
        const { event_id, page_location, page_title, design, ...ecommerce } =
            payload;

        // Clear the previous ecommerce object so items never leak between events.
        window.dataLayer.push({ ecommerce: null });
        window.dataLayer.push({
            event,
            event_id,
            page_location,
            page_title,
            design,
            ecommerce: event === 'page_view' ? undefined : ecommerce,
        });
    }

    if (config.metaPixel && window.fbq) {
        window.fbq(
            'track',
            META_EVENTS[event],
            event === 'page_view'
                ? {}
                : {
                      currency: payload.currency,
                      value: payload.value,
                      content_type: 'product',
                      content_ids: contents.map((item) => item.id),
                      contents,
                  },
            { eventID: payload.event_id },
        );
    }

    if (config.tiktok && window.ttq) {
        if (event === 'page_view') {
            window.ttq.page();
        } else if (TIKTOK_EVENTS[event]) {
            window.ttq.track(
                TIKTOK_EVENTS[event]!,
                {
                    currency: payload.currency,
                    value: payload.value,
                    contents: contents.map((item) => ({
                        content_id: item.id,
                        content_type: 'product',
                        quantity: item.quantity,
                        price: item.item_price,
                    })),
                },
                { event_id: payload.event_id },
            );
        }
    }

    if (posthog) {
        posthog.capture(event === 'page_view' ? '$pageview' : event, payload);
    }
}

export function track(event: TrackEvent, payload: TrackPayload = {}): void {
    if (!isBrowser || !hasProviders(config)) {
        return;
    }

    const full: TrackPayload = {
        currency: 'EGP',
        event_id: newEventId(),
        ...payload,
    };

    if (!loaded) {
        if (getConsent() !== 'denied' && queue.length < 30) {
            queue.push({ event, payload: full });
        }

        return;
    }

    if (config.posthogKey && !posthog) {
        queue.push({ event, payload: full });

        return;
    }

    dispatch(event, full);
}
