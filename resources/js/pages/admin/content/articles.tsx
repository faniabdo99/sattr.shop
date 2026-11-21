import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState, rowClass, Table, Td, Th } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { pageClass } from '@/lib/admin';

type Props = {
    articles: {
        id: number;
        title: string;
        category: string | null;
        published: boolean;
        published_at: string | null;
        reading_minutes: number | null;
        edit_url: string;
    }[];
    urls: { create: string; categories: string };
};

export default function Articles({ articles, urls }: Props) {
    return (
        <div className={pageClass}>
            <Head title="Journal" />
            <PageHeader
                title="Journal"
                description="Articles for search traffic and internal links to faculty pages."
                actions={
                    <>
                        <Button asChild variant="outline" size="sm">
                            <Link href={urls.categories}>
                                Manage categories
                            </Link>
                        </Button>
                        <Button asChild size="sm">
                            <Link href={urls.create}>
                                <Plus aria-hidden />
                                New article
                            </Link>
                        </Button>
                    </>
                }
            />

            {articles.length === 0 ? (
                <EmptyState title="No articles yet">
                    Write the first journal article.
                </EmptyState>
            ) : (
                <Table caption="Journal articles">
                    <thead>
                        <tr>
                            <Th>Title</Th>
                            <Th>Category</Th>
                            <Th>Publish date</Th>
                            <Th numeric>Read time</Th>
                            <Th>State</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((article) => {
                            const scheduled =
                                !article.published &&
                                article.published_at !== null;

                            return (
                                <tr key={article.id} className={rowClass}>
                                    <th
                                        scope="row"
                                        className="px-3 py-2.5 text-left font-medium"
                                    >
                                        <Link
                                            href={article.edit_url}
                                            dir="auto"
                                            className="text-line underline-offset-4 hover:underline"
                                        >
                                            {article.title || 'Untitled'}
                                        </Link>
                                    </th>
                                    <Td>{article.category ?? '—'}</Td>
                                    <Td className="whitespace-nowrap text-muted-foreground tabular-nums">
                                        {article.published_at ?? '—'}
                                    </Td>
                                    <Td numeric>
                                        {article.reading_minutes
                                            ? `${article.reading_minutes} min`
                                            : '—'}
                                    </Td>
                                    <Td>
                                        {scheduled ? (
                                            <StatusBadge
                                                value="scheduled"
                                                label="Scheduled"
                                                tone="info"
                                            />
                                        ) : (
                                            <StatusBadge
                                                value={
                                                    article.published
                                                        ? 'published'
                                                        : 'draft'
                                                }
                                            />
                                        )}
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                </Table>
            )}
        </div>
    );
}
