import { Link } from '@inertiajs/react';
import { RuledLine } from '@/components/site/ruled-line';
import { Wordmark } from '@/components/site/site-header';
import { useSite, useT } from '@/hooks/use-t';

export function SiteFooter() {
    const t = useT();
    const { site } = useSite();
    const social = Object.entries(site.social);

    return (
        <footer className="mt-auto bg-paper pb-28 md:pb-12">
            <div className="wrap">
                <RuledLine />
                <div className="grid gap-12 py-14 md:grid-cols-12 md:gap-8 md:py-20">
                    <div className="md:col-span-4">
                        <Wordmark className="text-[2.5rem]" />
                        <p className="mt-4 max-w-xs text-ink-soft">
                            {t('footer.tagline')}
                        </p>
                    </div>

                    <nav
                        aria-label={t('nav.faculties')}
                        className="md:col-span-4"
                    >
                        <h2 className="text-sm font-medium">
                            {t('nav.faculties')}
                        </h2>
                        <ul className="mt-4 grid grid-cols-2 gap-x-6 text-[0.9375rem] text-ink-soft">
                            {site.faculties.map((faculty) => (
                                <li key={faculty.url}>
                                    <Link
                                        href={faculty.url}
                                        className="link-line inline-flex min-h-9 items-center hover:text-ink"
                                    >
                                        {faculty.name}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <nav
                        aria-label={t('footer.help')}
                        className="md:col-span-2"
                    >
                        <h2 className="text-sm font-medium">
                            {t('footer.help')}
                        </h2>
                        <ul className="mt-4 text-[0.9375rem] text-ink-soft">
                            {site.pages.map((page) => (
                                <li key={page.url}>
                                    <Link
                                        href={page.url}
                                        className="link-line inline-flex min-h-9 items-center hover:text-ink"
                                    >
                                        {page.title}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </nav>

                    <div className="md:col-span-2">
                        <h2 className="text-sm font-medium">
                            {t('footer.contact')}
                        </h2>
                        <ul className="mt-4 text-[0.9375rem] text-ink-soft">
                            {site.whatsapp && (
                                <li>
                                    <a
                                        href={site.whatsapp}
                                        rel="noopener"
                                        target="_blank"
                                        className="link-line inline-flex min-h-9 items-center hover:text-ink"
                                    >
                                        {t('footer.whatsapp')}
                                    </a>
                                </li>
                            )}
                            {site.email && (
                                <li>
                                    <a
                                        href={`mailto:${site.email}`}
                                        className="link-line inline-flex min-h-9 items-center hover:text-ink"
                                    >
                                        {site.email}
                                    </a>
                                </li>
                            )}
                            {social.map(([network, href]) => (
                                <li key={network}>
                                    <a
                                        href={href}
                                        rel="noopener"
                                        target="_blank"
                                        className="link-line inline-flex min-h-9 items-center capitalize hover:text-ink"
                                    >
                                        {t(`footer.social.${network}`)}
                                    </a>
                                </li>
                            ))}
                            <li>
                                <Link
                                    href={site.journal}
                                    className="link-line inline-flex min-h-9 items-center hover:text-ink"
                                >
                                    {t('nav.journal')}
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>
                <p className="border-t border-stone py-6 text-sm text-ink-soft">
                    {t('footer.rights', { year: new Date().getFullYear() })}
                </p>
            </div>
        </footer>
    );
}
