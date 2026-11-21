import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { useSite, useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';

export function Wordmark({ className }: { className?: string }) {
    const t = useT();

    return (
        <span className={cn('display text-[1.75rem] leading-none', className)}>
            {t('brand')}
        </span>
    );
}

export function SiteHeader() {
    const t = useT();
    const { site, locale } = useSite();
    const { seo } = usePage().props;
    const url = usePage().url;
    const [open, setOpen] = useState(false);
    const [lastUrl, setLastUrl] = useState(url);

    if (url !== lastUrl) {
        setLastUrl(url);
        setOpen(false);
    }

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : '';

        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    const other = locale === 'ar' ? 'en' : 'ar';
    const otherUrl = seo?.alternates?.[other] ?? `/${other}`;
    const path = url.split('?')[0];

    const links = [
        { label: t('nav.product'), href: site.product },
        { label: t('nav.journal'), href: site.journal },
        ...site.pages
            .filter((page) => page.key === 'about')
            .map((page) => ({ label: page.title, href: page.url })),
    ];

    const isCurrent = (href: string) =>
        decodeURI(path).startsWith(decodeURI(new URL(href).pathname));

    return (
        <header className="relative z-40 border-b border-stone bg-paper">
            <div className="wrap flex h-16 items-center justify-between gap-6 md:h-20">
                <Link href={site.home} aria-label={t('nav.home_label')}>
                    <Wordmark />
                </Link>

                <nav
                    aria-label={t('nav.main')}
                    className="hidden items-center gap-9 text-[0.9375rem] md:flex"
                >
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="link-line"
                            aria-current={
                                isCurrent(link.href) ? 'page' : undefined
                            }
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-5 text-[0.9375rem]">
                    <a
                        href={otherUrl}
                        hrefLang={other}
                        lang={other}
                        className="link-line"
                    >
                        {t('nav.switch_language')}
                    </a>
                    <Link
                        href={site.checkout}
                        className="hidden min-h-11 items-center bg-ink px-6 font-medium text-paper transition-colors duration-300 hover:bg-line md:inline-flex"
                    >
                        {t('cta.order')}
                    </Link>
                    <button
                        type="button"
                        className="-me-2 flex size-11 flex-col items-center justify-center gap-[7px] md:hidden"
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen(!open)}
                    >
                        <span className="sr-only">
                            {open ? t('nav.close_menu') : t('nav.open_menu')}
                        </span>
                        <span
                            aria-hidden="true"
                            className={cn(
                                'h-px w-6 bg-ink transition-transform duration-500 ease-quiet',
                                open && 'translate-y-1 rotate-45',
                            )}
                        />
                        <span
                            aria-hidden="true"
                            className={cn(
                                'h-px w-6 bg-ink transition-transform duration-500 ease-quiet',
                                open && '-translate-y-1 -rotate-45',
                            )}
                        />
                    </button>
                </div>
            </div>

            <div
                id="mobile-menu"
                hidden={!open}
                className="absolute inset-x-0 top-full h-[calc(100dvh-4rem)] overflow-y-auto bg-paper md:hidden"
            >
                <nav
                    aria-label={t('nav.main')}
                    className="wrap flex flex-col py-8"
                >
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="display border-b border-stone py-5 text-display-md"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <p className="mt-10 mb-2 text-sm text-ink-soft">
                        {t('nav.faculties')}
                    </p>
                    <ul className="grid grid-cols-2 gap-x-6">
                        {site.faculties.map((faculty) => (
                            <li key={faculty.url}>
                                <Link
                                    href={faculty.url}
                                    className="flex min-h-11 items-center"
                                >
                                    {faculty.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </nav>
            </div>
        </header>
    );
}
