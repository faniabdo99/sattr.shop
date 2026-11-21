import { Head, usePage } from '@inertiajs/react';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { ConsentBanner } from '@/components/site/consent-banner';
import { SiteFooter } from '@/components/site/site-footer';
import { SiteHeader } from '@/components/site/site-header';
import { useSite, useT } from '@/hooks/use-t';
import { exactTitle } from '@/lib/head';
import { captureAttribution, initTracking, track } from '@/lib/track';
import type { Seo } from '@/types/site';

/**
 * The server writes the document head (see partials/seo.blade.php). On
 * in-app navigation this keeps those same tags in step with the new page.
 */
function syncHead(seo: Seo): void {
    const set = (name: string, attribute: string, value: string | null) => {
        const element = document.head.querySelector(`[data-seo="${name}"]`);

        if (element && value !== null) {
            element.setAttribute(attribute, value);
        }
    };

    set('description', 'content', seo.description ?? '');
    set(
        'robots',
        'content',
        seo.noindex
            ? 'noindex, follow'
            : 'index, follow, max-image-preview:large',
    );
    set('canonical', 'href', seo.canonical);
    set('og:title', 'content', seo.title);
    set('og:description', 'content', seo.description ?? '');
    set('og:url', 'content', seo.canonical);
    set('og:image', 'content', seo.image);

    document.head
        .querySelectorAll('[data-seo="alternate"]')
        .forEach((element) => element.remove());

    const alternates = { ...seo.alternates };

    if (alternates.ar) {
        alternates['x-default'] = alternates.ar;
    }

    for (const [lang, href] of Object.entries(alternates)) {
        const link = document.createElement('link');

        link.rel = 'alternate';
        link.hreflang = lang;
        link.href = href;
        link.dataset.seo = 'alternate';
        document.head.appendChild(link);
    }

    const schema = document.head.querySelector('[data-seo="schema"]');

    if (schema) {
        schema.textContent = JSON.stringify(seo.schema);
    }
}

export default function SiteLayout({ children }: { children: ReactNode }) {
    const t = useT();
    const { site } = useSite();
    const { seo } = usePage().props;
    const url = usePage().url;
    const path = url.split('?')[0];
    const reduce = useReducedMotion();
    const first = useRef(true);

    exactTitle.current = seo?.title ?? '';

    useEffect(() => {
        document.documentElement.classList.add('js');
        captureAttribution();
        initTracking(site.tracking);
    }, [site.tracking]);

    useEffect(() => {
        if (seo && !first.current) {
            syncHead(seo);
        }

        track('page_view', {
            page_location: window.location.href,
            page_title: seo?.title,
        });
        first.current = false;
        // One page view per visited URL.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [path]);

    return (
        <div className="site flex min-h-dvh flex-col font-sans">
            <Head title={seo?.title} />
            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-50 focus:bg-ink focus:px-4 focus:py-3 focus:text-paper"
            >
                {t('nav.skip')}
            </a>
            <SiteHeader />
            <motion.main
                id="main"
                key={path}
                initial={reduce || first.current ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex-1"
            >
                {children}
            </motion.main>
            <SiteFooter />
            <ConsentBanner />
        </div>
    );
}
