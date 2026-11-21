import { Cta } from '@/components/site/cta';
import { RuledLine } from '@/components/site/ruled-line';
import { useSite, useT } from '@/hooks/use-t';

type Props = {
    page: {
        key: string | null;
        title: string;
        excerpt: string | null;
        body: string | null;
        updated: string | null;
    };
};

export default function StaticPage({ page }: Props) {
    const t = useT();
    const { site } = useSite();

    return (
        <article className="wrap py-12 md:py-20">
            <header className="max-w-3xl">
                <h1 className="display text-display-xl">{page.title}</h1>
                {page.excerpt && (
                    <p className="mt-5 text-lede text-ink-soft">
                        {page.excerpt}
                    </p>
                )}
            </header>
            <RuledLine className="mt-10 md:mt-14" />
            {page.body && (
                <div
                    className="prose-sattr mt-10 md:mt-14"
                    dangerouslySetInnerHTML={{ __html: page.body }}
                />
            )}
            {page.key === 'contact' && (
                <div className="mt-10 flex flex-wrap items-center gap-6">
                    {site.whatsapp && (
                        <Cta href={site.whatsapp}>{t('page.whatsapp_cta')}</Cta>
                    )}
                    {site.email && (
                        <a href={`mailto:${site.email}`} className="link-line">
                            {site.email}
                        </a>
                    )}
                </div>
            )}
            {page.updated && page.key !== 'about' && page.key !== 'contact' && (
                <p className="mt-14 text-sm text-ink-soft">
                    {t('page.updated', { date: page.updated })}
                </p>
            )}
        </article>
    );
}
