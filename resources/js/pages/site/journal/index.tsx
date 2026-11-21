import { Link } from '@inertiajs/react';
import { buttonClasses } from '@/components/brand/Button';
import { ArticleCard } from '@/components/site/article-card';
import { SignatureLine } from '@/components/brand/SignatureLine';
import { useT } from '@/hooks/use-t';
import type { ArticleCard as Article } from '@/types/site';

type Props = {
    heading: string;
    intro: string;
    search: string;
    journal_url: string;
    articles: Article[];
    pagination: {
        prev: string | null;
        next: string | null;
        current: number;
        last: number;
    };
    categories: { name: string; url: string; active: boolean }[];
};

export default function JournalIndex({
    heading,
    intro,
    search,
    journal_url,
    articles,
    pagination,
    categories,
}: Props) {
    const t = useT();
    const anyActive = categories.some((category) => category.active);

    return (
        <div className="wrap py-12 md:py-20">
            <header className="grid gap-6 md:grid-cols-12 md:gap-8">
                <div className="md:col-span-7">
                    <h1 className="display text-display-l">
                        {search
                            ? t('journal.results_for', { query: search })
                            : heading}
                    </h1>
                    <p className="measure mt-5 text-body-l text-ink-muted">
                        {intro}
                    </p>
                </div>
                <form
                    action={journal_url}
                    method="get"
                    role="search"
                    className="flex items-end gap-4 self-end md:col-span-4 md:col-start-9"
                >
                    <label className="flex-1">
                        <span className="text-label text-ink-muted">
                            {t('journal.search')}
                        </span>
                        <input
                            type="search"
                            name="q"
                            defaultValue={search}
                            className="mt-2 block h-12 w-full rounded-sm border border-sand bg-paper-raised px-4 focus:border-ink focus:outline-none"
                        />
                    </label>
                    <button
                        type="submit"
                        className={buttonClasses('secondary')}
                    >
                        {t('journal.search_button')}
                    </button>
                </form>
            </header>

            <nav aria-label={t('journal.categories')} className="mt-12">
                <SignatureLine className="max-w-24" />
                <ul className="flex flex-wrap gap-x-8 gap-y-1 pt-4 text-[0.9375rem]">
                    <li>
                        <Link
                            href={journal_url}
                            className="link-line inline-flex min-h-11 items-center"
                            data-active={!anyActive && !search}
                        >
                            {t('journal.all')}
                        </Link>
                    </li>
                    {categories.map((category) => (
                        <li key={category.url}>
                            <Link
                                href={category.url}
                                className="link-line inline-flex min-h-11 items-center"
                                data-active={category.active}
                                aria-current={
                                    category.active ? 'page' : undefined
                                }
                            >
                                {category.name}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {articles.length === 0 ? (
                <p className="py-24 text-body-l text-ink-muted">
                    {search ? t('journal.empty_search') : t('journal.empty')}
                </p>
            ) : (
                <div className="mt-12 grid gap-x-8 gap-y-16 md:grid-cols-3">
                    {articles.map((article) => (
                        <ArticleCard key={article.url} article={article} />
                    ))}
                </div>
            )}

            {pagination.last > 1 && (
                <nav
                    aria-label="Pagination"
                    className="mt-20 flex items-center justify-between border-t border-sand pt-6 text-[0.9375rem]"
                >
                    {pagination.prev ? (
                        <Link
                            href={pagination.prev}
                            rel="prev"
                            className="link-line"
                        >
                            {t('journal.newer')}
                        </Link>
                    ) : (
                        <span />
                    )}
                    <span className="text-ink-muted">
                        {t('journal.page_of', {
                            current: pagination.current,
                            last: pagination.last,
                        })}
                    </span>
                    {pagination.next ? (
                        <Link
                            href={pagination.next}
                            rel="next"
                            className="link-line"
                        >
                            {t('journal.older')}
                        </Link>
                    ) : (
                        <span />
                    )}
                </nav>
            )}
        </div>
    );
}
