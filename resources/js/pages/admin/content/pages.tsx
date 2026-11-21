import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState, rowClass, Table, Td, Th } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';

type Props = {
    type: 'faculty' | 'static';
    pages: {
        id: number;
        title: string;
        slug: unknown;
        design: string | null;
        is_published: boolean;
        noindex: boolean | null;
        edit_url: string;
    }[];
    urls: { faculty: string; static: string; create: string };
};

export default function Pages({ type, pages, urls }: Props) {
    const tabs = [
        { key: 'faculty', label: 'Faculty pages', href: urls.faculty },
        { key: 'static', label: 'Static pages', href: urls.static },
    ] as const;
    const isFaculty = type === 'faculty';

    return (
        <div className={pageClass}>
            <Head title={isFaculty ? 'Faculty pages' : 'Static pages'} />
            <PageHeader
                title="Pages"
                description={
                    isFaculty
                        ? 'One landing page per design. They are created with the design and deleted with it.'
                        : 'About, policies and other standalone pages.'
                }
                actions={
                    !isFaculty && (
                        <Button asChild size="sm">
                            <Link href={urls.create}>
                                <Plus aria-hidden />
                                New static page
                            </Link>
                        </Button>
                    )
                }
            />

            <nav
                aria-label="Page type"
                className="flex gap-1 border-b border-border"
            >
                {tabs.map((tab) => (
                    <Link
                        key={tab.key}
                        href={tab.href}
                        aria-current={tab.key === type ? 'page' : undefined}
                        className={cn(
                            '-mb-px border-b-2 px-3 py-2 text-sm',
                            tab.key === type
                                ? 'border-line font-medium text-line'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {tab.label}
                    </Link>
                ))}
            </nav>

            {pages.length === 0 ? (
                <EmptyState title="No pages here yet">
                    {isFaculty
                        ? 'Faculty pages appear when you add a design.'
                        : 'Create the first static page.'}
                </EmptyState>
            ) : (
                <Table caption={isFaculty ? 'Faculty pages' : 'Static pages'}>
                    <thead>
                        <tr>
                            <Th>Title</Th>
                            {isFaculty && <Th>Design</Th>}
                            <Th>Slug (EN)</Th>
                            <Th>Slug (AR)</Th>
                            <Th>State</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {pages.map((page) => {
                            const slug = bi(page.slug);

                            return (
                                <tr key={page.id} className={rowClass}>
                                    <th
                                        scope="row"
                                        className="px-3 py-2.5 text-left font-medium"
                                    >
                                        <Link
                                            href={page.edit_url}
                                            dir="auto"
                                            className="text-line underline-offset-4 hover:underline"
                                        >
                                            {page.title || 'Untitled'}
                                        </Link>
                                    </th>
                                    {isFaculty && <Td>{page.design ?? '—'}</Td>}
                                    <Td className="font-mono text-xs text-muted-foreground">
                                        /{slug.en}
                                    </Td>
                                    <Td className="text-xs text-muted-foreground">
                                        <span dir="rtl" lang="ar">
                                            {slug.ar}
                                        </span>
                                    </Td>
                                    <Td>
                                        <span className="flex flex-wrap gap-1.5">
                                            <StatusBadge
                                                value={
                                                    page.is_published
                                                        ? 'published'
                                                        : 'draft'
                                                }
                                            />
                                            {page.noindex && (
                                                <StatusBadge
                                                    value="noindex"
                                                    label="Noindex"
                                                />
                                            )}
                                        </span>
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
