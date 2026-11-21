import { Link } from '@inertiajs/react';
import { ArticleCard } from '@/components/site/article-card';
import { Cta } from '@/components/site/cta';
import { Notebook } from '@/components/site/notebook';
import { Picture } from '@/components/site/picture';
import { SectionHeading } from '@/components/site/section-heading';
import { useSite, useT } from '@/hooks/use-t';
import type { ArticleCard as Article, Product } from '@/types/site';

type Props = {
    article: Article & { body: string | null };
    related: Article[];
    faculty: { name: string; title: string; url: string; tint: string } | null;
    product: Product;
};

export default function JournalShow({
    article,
    related,
    faculty,
    product,
}: Props) {
    const t = useT();
    const { site } = useSite();

    return (
        <>
            <article className="wrap py-10 md:py-16">
                <header className="mx-auto max-w-3xl">
                    <p className="text-sm text-ink-soft">
                        <Link href={site.journal} className="link-line">
                            {t('journal.title')}
                        </Link>
                        {article.category && (
                            <>
                                <span aria-hidden="true" className="mx-2">
                                    /
                                </span>
                                <Link
                                    href={article.category.url}
                                    className="link-line"
                                >
                                    {article.category.name}
                                </Link>
                            </>
                        )}
                    </p>
                    <h1 className="display mt-5 text-display-lg">
                        {article.title}
                    </h1>
                    {article.excerpt && (
                        <p className="mt-5 text-lede text-ink-soft">
                            {article.excerpt}
                        </p>
                    )}
                    <p className="mt-6 flex flex-wrap gap-x-5 border-t border-stone pt-4 text-sm text-ink-soft">
                        {article.author && (
                            <span>
                                {t('journal.by', { author: article.author })}
                            </span>
                        )}
                        {article.published_at && (
                            <time dateTime={article.published_at}>
                                {article.published_label}
                            </time>
                        )}
                        <span>
                            {t('journal.reading_time', {
                                minutes: article.reading_minutes,
                            })}
                        </span>
                    </p>
                </header>

                {article.cover && (
                    <Picture
                        image={article.cover}
                        ratio="16 / 9"
                        sizes="(min-width: 1024px) 80vw, 100vw"
                        priority
                        className="mx-auto mt-10 max-w-5xl"
                    />
                )}

                {article.body && (
                    <div
                        className="prose-sattr mx-auto mt-10 max-w-3xl md:mt-14"
                        dangerouslySetInnerHTML={{ __html: article.body }}
                    />
                )}

                <aside className="mx-auto mt-16 max-w-3xl border-y border-stone py-8">
                    <div className="flex items-center gap-6">
                        {faculty && (
                            <div className="w-20 shrink-0">
                                <Notebook designKey="" tint={faculty.tint} />
                            </div>
                        )}
                        <div className="flex-1">
                            <p className="text-sm text-ink-soft">
                                {faculty
                                    ? t('journal.faculty_block')
                                    : t('journal.product_block_title')}
                            </p>
                            <p className="display mt-1 text-display-sm">
                                <Link
                                    href={faculty?.url ?? product.url}
                                    className="link-line"
                                >
                                    {faculty?.title ?? product.tagline}
                                </Link>
                            </p>
                            <p className="mt-2 text-ink-soft">
                                {product.price_label},{' '}
                                {t('product.instapay_price')}{' '}
                                {product.instapay_label}
                            </p>
                        </div>
                    </div>
                    <div className="mt-6">
                        <Cta href={faculty?.url ?? product.url} variant="ghost">
                            {faculty
                                ? t('cta.view_design', { design: faculty.name })
                                : t('cta.view_pack')}
                        </Cta>
                    </div>
                </aside>
            </article>

            {related.length > 0 && (
                <section
                    aria-labelledby="related-title"
                    className="wrap py-16 md:py-24"
                >
                    <SectionHeading
                        id="related-title"
                        title={t('journal.related')}
                    />
                    <div className="grid gap-12 md:grid-cols-3 md:gap-8">
                        {related.map((item) => (
                            <ArticleCard key={item.url} article={item} />
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
