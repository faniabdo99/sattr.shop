import { Link } from '@inertiajs/react';
import { Logo } from '@/components/brand/Logo';
import { useSite, useT } from '@/hooks/use-t';

const linkClass =
    'link-line inline-flex min-h-9 items-center text-ink-muted hover:text-ink';

export function SiteFooter() {
    const t = useT();
    const { site, locale } = useSite();
    const social = Object.entries(site.social);

    return (
        <footer data-theme="ink" className="mt-auto pb-24 md:pb-0">
            <div className="wrap">
                <div className="grid gap-12 py-12 md:grid-cols-12 md:gap-8 md:py-24">
                    <div className="md:col-span-5">
                        <Logo
                            variant={locale === 'ar' ? 'lockup-ar' : 'lockup'}
                            tone="dark"
                            size={40}
                            labelled={false}
                        />
                        <p className="display mt-6 max-w-sm text-display-m">
                            {t('footer.tagline')}
                        </p>
                        <p className="mt-6 text-label text-ink-muted" dir="ltr">
                            {site.social.instagram ? (
                                <a
                                    href={site.social.instagram}
                                    target="_blank"
                                    rel="noopener"
                                    className="link-line"
                                >
                                    {t('footer.handle')}
                                </a>
                            ) : (
                                t('footer.handle')
                            )}
                        </p>
                    </div>

                    <nav
                        aria-label={t('nav.faculties')}
                        className="md:col-span-3 md:col-start-7"
                    >
                        <h2 className="overline">{t('nav.faculties')}</h2>
                        <ul className="mt-4 grid grid-cols-2 gap-x-6 md:grid-cols-1 lg:grid-cols-2">
                            {site.faculties.map((faculty) => (
                                <li key={faculty.url}>
                                    <Link
                                        href={faculty.url}
                                        className={linkClass}
                                    >
                                        {faculty.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav
                        aria-label={t('footer.help')}
                        className="md:col-span-3"
                    >
                        <h2 className="overline">{t('footer.help')}</h2>
                        <ul className="mt-4">
                            {site.pages.map((page) => (
                                <li key={page.url}>
                                    <Link href={page.url} className={linkClass}>
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <Link href={site.journal} className={linkClass}>
                                    {t('nav.journal')}
                                </Link>
                            </li>
                            {site.whatsapp && (
                                <li>
                                    <a
                                        href={site.whatsapp}
                                        rel="noopener"
                                        target="_blank"
                                        className={linkClass}
                                    >
                                        {t('footer.whatsapp')}
                                    </a>
                                </li>
                            )}
                            {site.email && (
                                <li>
                                    <a
                                        href={`mailto:${site.email}`}
                                        className={linkClass}
                                    >
                                        {site.email}
                                    </a>
                                </li>
                            )}
                            {social
                                .filter(([network]) => network !== 'instagram')
                                .map(([network, href]) => (
                                    <li key={network}>
                                        <a
                                            href={href}
                                            rel="noopener"
                                            target="_blank"
                                            className={linkClass}
                                        >
                                            {t(`footer.social.${network}`)}
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    </nav>
                </div>
                <p className="border-t border-sand py-6 text-caption text-ink-muted">
                    {t('footer.rights', { year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
}
