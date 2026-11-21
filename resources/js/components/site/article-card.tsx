import { Link } from '@inertiajs/react';
import { Picture } from '@/components/site/picture';
import { useT } from '@/hooks/use-t';
import type { ArticleCard as Article } from '@/types/site';

export function ArticleCard({ article }: { article: Article }) {
    const t = useT();

    return (
        <article className="group flex flex-col">
            <Link
                href={article.url}
                className="block"
                tabIndex={-1}
                aria-hidden="true"
            >
                <Picture
                    image={article.cover}
                    ratio="3 / 2"
                    sizes="(min-width: 768px) 33vw, 100vw"
                    imgClassName="transition-transform duration-[1200ms] ease-quiet group-hover:scale-[1.03]"
                    fallback={
                        <span className="display text-display-sm text-ink/25">
                            {t('brand')}
                        </span>
                    }
                />
            </Link>
            <p className="mt-5 text-sm text-ink-soft">
                {article.category?.name}
                {article.category && article.published_label ? ' / ' : ''}
                {article.published_at && (
                    <time dateTime={article.published_at}>
                        {article.published_label}
                    </time>
                )}
            </p>
            <h3 className="display mt-2 text-display-sm">
                <Link href={article.url} className="link-line">
                    {article.title}
                </Link>
            </h3>
            {article.excerpt && (
                <p className="mt-3 text-ink-soft">{article.excerpt}</p>
            )}
            <p className="mt-3 text-sm text-ink-soft">
                {t('journal.reading_time', {
                    minutes: article.reading_minutes,
                })}
            </p>
        </article>
    );
}
