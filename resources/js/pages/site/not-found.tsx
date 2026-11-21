import { Link } from '@inertiajs/react';
import { ArticleCard } from '@/components/site/article-card';
import { Cta } from '@/components/site/cta';
import { SignatureLine } from '@/components/brand/SignatureLine';
import { useSite, useT } from '@/hooks/use-t';
import type { ArticleCard as Article } from '@/types/site';

type Props = {
    faculties: { name: string; url: string }[];
    articles: Article[];
};

export default function NotFound({ faculties, articles }: Props) {
    const t = useT();
    const { site } = useSite();

    return (
        <div className="wrap py-12 md:py-24">
            <p className="text-sm text-ink-muted tabular-nums">404</p>
            <h1 className="display mt-3 text-display-l">
                {t('not_found.title')}
            </h1>
            <p className="measure mt-6 text-body-l text-ink-muted">
                {t('not_found.body')}
            </p>
            <div className="mt-8">
                <Cta href={site.home}>{t('not_found.home')}</Cta>
            </div>

            <section aria-labelledby="nf-faculties" className="mt-20">
                <SignatureLine className="max-w-24" />
                <h2 id="nf-faculties" className="display mt-8 text-display-m">
                    {t('not_found.faculties')}
                </h2>
                <ul className="mt-6 grid grid-cols-2 gap-x-8 md:grid-cols-4">
                    {faculties.map((faculty) => (
                        <li key={faculty.url} className="border-b border-sand">
                            <Link
                                href={faculty.url}
                                className="link-line flex min-h-12 items-center"
                            >
                                {faculty.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {articles.length > 0 && (
                <section aria-labelledby="nf-articles" className="mt-20">
                    <SignatureLine className="max-w-24" />
                    <h2
                        id="nf-articles"
                        className="display mt-8 text-display-m"
                    >
                        {t('not_found.articles')}
                    </h2>
                    <div className="mt-8 grid gap-12 md:grid-cols-3 md:gap-8">
                        {articles.map((article) => (
                            <ArticleCard key={article.url} article={article} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
