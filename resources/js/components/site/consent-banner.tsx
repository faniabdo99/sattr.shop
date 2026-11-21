import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useSite, useT } from '@/hooks/use-t';
import { getConsent, hasProviders, setConsent } from '@/lib/track';

/**
 * Cookie consent. Appears only when a tracking provider is configured and
 * the visitor has not chosen yet. Nothing loads until they accept.
 */
export function ConsentBanner() {
    const t = useT();
    const { site } = useSite();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (hasProviders(site.tracking) && getConsent() === null) {
            setVisible(true);
        }
    }, [site.tracking]);

    if (!visible) {
        return null;
    }

    const choose = (value: 'granted' | 'denied') => {
        setConsent(value);
        setVisible(false);
    };

    const privacy = site.pages.find((page) => page.key === 'privacy');

    return (
        <section
            role="dialog"
            aria-label={t('consent.title')}
            className="fixed inset-x-0 bottom-0 z-50 border-t border-ink bg-paper"
        >
            <div className="wrap flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
                <p className="max-w-2xl text-sm">
                    {t('consent.body')}{' '}
                    {privacy && (
                        <Link href={privacy.url} className="underline">
                            {privacy.title}
                        </Link>
                    )}
                </p>
                <div className="flex shrink-0 gap-3">
                    <button
                        type="button"
                        onClick={() => choose('denied')}
                        className="min-h-11 flex-1 border border-ink/30 px-5 text-sm font-medium hover:border-ink md:flex-none"
                    >
                        {t('consent.decline')}
                    </button>
                    <button
                        type="button"
                        onClick={() => choose('granted')}
                        className="min-h-11 flex-1 bg-ink px-5 text-sm font-medium text-paper hover:bg-line md:flex-none"
                    >
                        {t('consent.accept')}
                    </button>
                </div>
            </div>
        </section>
    );
}
