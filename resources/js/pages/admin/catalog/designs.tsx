import { Head, Link } from '@inertiajs/react';
import { Plus } from 'lucide-react';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState, rowClass, Table, Td, Th } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { bi, pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';

type Props = {
    designs: {
        id: number;
        key: string;
        name: unknown;
        tint: string;
        stock: number;
        sort: number;
        is_active: boolean;
        images: number;
        edit_url: string;
    }[];
    create_url: string;
    stock_total: number;
};

export default function Designs({ designs, create_url, stock_total }: Props) {
    return (
        <div className={pageClass}>
            <Head title="Designs" />
            <PageHeader
                title="Designs"
                description="One notebook design per faculty. Each design has its own stock and faculty landing page."
                actions={
                    <Button asChild size="sm">
                        <Link href={create_url}>
                            <Plus aria-hidden />
                            New design
                        </Link>
                    </Button>
                }
            />

            {designs.length === 0 ? (
                <EmptyState title="No designs yet">
                    Add the first design to start selling.
                </EmptyState>
            ) : (
                <Table caption="Designs">
                    <thead>
                        <tr>
                            <Th numeric className="w-12">
                                Sort
                            </Th>
                            <Th>Design</Th>
                            <Th>Key</Th>
                            <Th numeric>Stock</Th>
                            <Th numeric>Images</Th>
                            <Th>State</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {designs.map((design) => {
                            const name = bi(design.name);

                            return (
                                <tr key={design.id} className={rowClass}>
                                    <Td
                                        numeric
                                        className="text-muted-foreground"
                                    >
                                        {design.sort}
                                    </Td>
                                    <th
                                        scope="row"
                                        className="px-3 py-2.5 text-left font-medium"
                                    >
                                        <Link
                                            href={design.edit_url}
                                            className="inline-flex items-center gap-2 text-line underline-offset-4 hover:underline"
                                        >
                                            <span
                                                aria-hidden
                                                className="size-3 shrink-0 rounded-full border border-black/10"
                                                style={{
                                                    backgroundColor:
                                                        design.tint,
                                                }}
                                            />
                                            {name.en || name.ar}
                                        </Link>
                                        {name.en && name.ar && (
                                            <span
                                                dir="rtl"
                                                lang="ar"
                                                className="ml-2 text-xs font-normal text-muted-foreground"
                                            >
                                                {name.ar}
                                            </span>
                                        )}
                                    </th>
                                    <Td className="font-mono text-xs text-muted-foreground">
                                        {design.key}
                                    </Td>
                                    <Td
                                        numeric
                                        className={cn(
                                            design.stock === 0 &&
                                                'font-medium text-danger',
                                        )}
                                    >
                                        {design.stock}
                                    </Td>
                                    <Td
                                        numeric
                                        className={cn(
                                            design.images === 0 &&
                                                'text-danger',
                                        )}
                                    >
                                        {design.images}
                                    </Td>
                                    <Td>
                                        <StatusBadge
                                            value={
                                                design.is_active
                                                    ? 'active'
                                                    : 'inactive'
                                            }
                                        />
                                    </Td>
                                </tr>
                            );
                        })}
                    </tbody>
                    <tfoot>
                        <tr className="border-t border-border">
                            <th
                                scope="row"
                                colSpan={3}
                                className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                            >
                                Total stock
                            </th>
                            <Td numeric className="font-semibold">
                                {stock_total}
                            </Td>
                            <td colSpan={2} />
                        </tr>
                    </tfoot>
                </Table>
            )}
        </div>
    );
}
