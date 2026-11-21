import { Link, usePage } from '@inertiajs/react';
import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { buttonClasses } from '@/components/brand/Button';
import { Logo } from '@/components/brand/Logo';
import { useSite, useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';

export function SiteHeader() {
    const t = useT();
    const { site, locale } = useSite();
    const { seo } = usePage().props;
    const url = usePage().url;
    const [open, setOpen] = useState(false);
    const [lastUrl, setLastUrl] = useState(url);
    const [scrolled, setScrolled] = useState(false);

    if (url !== lastUrl) {
        setLastUrl(url);
        setOpen(false);
    }

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 8);

        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

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
        <header
            className={cn(
                'sticky top-0 z-40 border-b border-sand transition-colors duration-300',
                scrolled && !open ? 'bg-paper/90 backdrop-blur-md' : 'bg-paper',
            )}
        >
            <div className="wrap flex h-16 items-center justify-between gap-6 md:h-20">
                <Link
                    href={site.home}
                    aria-label={t('nav.home_label')}
                    className="inline-flex"
                >
                    <Logo
                        variant={locale === 'ar' ? 'lockup-ar' : 'lockup'}
                        size={34}
                        labelled={false}
                    />
                </Link>

                <nav
                    aria-label={t('nav.main')}
                    className="hidden items-center gap-8 text-label md:flex"
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

                <div className="flex items-center gap-4 text-label">
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
                        className={cn(
                            buttonClasses('primary'),
                            'hidden md:inline-flex',
                        )}
                    >
                        {t('cta.order')}
                    </Link>
                    <button
                        type="button"
                        className="-me-2 flex size-11 items-center justify-center md:hidden"
                        aria-expanded={open}
                        aria-controls="mobile-menu"
                        onClick={() => setOpen(!open)}
                    >
                        <span className="sr-only">
                            {open ? t('nav.close_menu') : t('nav.open_menu')}
                        </span>
                        {open ? (
                            <X size={24} strokeWidth={1.5} aria-hidden="true" />
                        ) : (
                            <Menu
                                size={24}
                                strokeWidth={1.5}
                                aria-hidden="true"
                            />
                        )}
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
                    className="wrap flex flex-col py-6"
                >
                    {links.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="display border-b border-sand py-4 text-display-m"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <p className="mt-8 mb-2 overline">{t('nav.faculties')}</p>
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
                    <Link
                        href={site.checkout}
                        className={cn(buttonClasses('primary', true), 'mt-8')}
                    >
                        {t('cta.order')}
                    </Link>
                </nav>
            </div>
        </header>
    );
}
