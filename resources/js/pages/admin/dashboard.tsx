import { Head, Link } from '@inertiajs/react';
import { Panel } from '@/components/admin/form';
import { OrdersTable } from '@/components/admin/orders-table';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState, rowClass, Td, Th } from '@/components/admin/table';
import { pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { OrderRow } from '@/types/admin';

type Period = {
    label: string;
    orders: number;
    revenue: string;
    methods: { label: string; orders: number; revenue: string }[];
};

type Props = {
    periods: Period[];
    share: { label: string; orders: number; percent: number }[];
    pending_verifications: number;
    flagged: number;
    new_orders: number;
    stock: { name: string; tint: string; stock: number; active: boolean }[];
    stock_total: number;
    top_faculties: { name: string; packs: number }[];
    top_sources: {
        source: string;
        medium: string;
        orders: number;
        revenue: string;
    }[];
    recent: OrderRow[];
    orders_url: string;
};

const LOW_STOCK = 5;
const shareColours = ['bg-line', 'bg-ink'];

function AttentionTile({
    href,
    count,
    label,
    hint,
}: {
    href: string;
    count: number;
    label: string;
    hint: string;
}) {
    return (
        <Link
            href={href}
            className={cn(
                'flex items-baseline gap-3 rounded-md border bg-card px-4 py-3 hover:bg-paper/60',
                count > 0 ? 'border-line/40' : 'border-border',
            )}
        >
            <span
                className={cn(
                    'text-2xl leading-none font-semibold tabular-nums',
                    count > 0 ? 'text-line' : 'text-muted-foreground',
                )}
            >
                {count}
            </span>
            <span className="min-w-0">
                <span className="block text-sm font-medium">{label}</span>
                <span className="block text-xs text-muted-foreground">
                    {hint}
                </span>
            </span>
        </Link>
    );
}

export default function Dashboard({
    periods,
    share,
    pending_verifications,
    flagged,
    new_orders,
    stock,
    stock_total,
    top_faculties,
    top_sources,
    recent,
    orders_url,
}: Props) {
    const shareTotal = share.reduce((sum, item) => sum + item.orders, 0);
    const maxStock = Math.max(1, ...stock.map((item) => item.stock));
    const maxPacks = Math.max(1, ...top_faculties.map((item) => item.packs));

    return (
        <div className={pageClass}>
            <Head title="Dashboard" />
            <PageHeader
                title="Dashboard"
                description="Orders and revenue exclude cancelled and returned orders."
            />

            <section
                aria-label="Needs attention"
                className="grid gap-3 sm:grid-cols-3"
            >
                <AttentionTile
                    href={`${orders_url}?payment_status=awaiting_verification`}
                    count={pending_verifications}
                    label="Payments to verify"
                    hint="InstaPay proofs waiting for review"
                />
                <AttentionTile
                    href={`${orders_url}?flagged=1`}
                    count={flagged}
                    label="Flagged unpaid InstaPay"
                    hint="No proof received in time"
                />
                <AttentionTile
                    href={`${orders_url}?status=pending`}
                    count={new_orders}
                    label="New orders"
                    hint="Pending, not yet confirmed"
                />
            </section>

            <section aria-label="Sales" className="grid gap-3 md:grid-cols-3">
                {periods.map((period) => (
                    <div
                        key={period.label}
                        className="rounded-md border border-border bg-card p-4"
                    >
                        <h2 className="text-xs font-medium text-muted-foreground">
                            {period.label}
                        </h2>
                        <p className="mt-2 text-2xl leading-none font-semibold tabular-nums">
                            {period.revenue}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground tabular-nums">
                            {period.orders}{' '}
                            {period.orders === 1 ? 'order' : 'orders'}
                        </p>
                        <dl className="mt-3 space-y-1 border-t border-border pt-3 text-xs">
                            {period.methods.map((method) => (
                                <div
                                    key={method.label}
                                    className="flex items-baseline justify-between gap-3"
                                >
                                    <dt className="text-muted-foreground">
                                        {method.label}
                                    </dt>
                                    <dd className="tabular-nums">
                                        {method.orders} · {method.revenue}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                    </div>
                ))}
            </section>

            <div className="grid gap-6 lg:grid-cols-2">
                <Panel
                    title="Payment method share"
                    description="Share of orders, last 30 days"
                >
                    {shareTotal === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No orders in the last 30 days.
                        </p>
                    ) : (
                        <>
                            <div
                                className="flex h-3 gap-0.5 overflow-hidden rounded-sm"
                                role="img"
                                aria-label={share
                                    .map(
                                        (item) =>
                                            `${item.label} ${item.percent}%`,
                                    )
                                    .join(', ')}
                            >
                                {share.map((item, index) => (
                                    <div
                                        key={item.label}
                                        className={
                                            shareColours[
                                                index % shareColours.length
                                            ]
                                        }
                                        style={{
                                            width: `${(item.orders / shareTotal) * 100}%`,
                                        }}
                                    />
                                ))}
                            </div>
                            <ul className="flex flex-wrap gap-x-6 gap-y-1 text-sm">
                                {share.map((item, index) => (
                                    <li
                                        key={item.label}
                                        className="flex items-center gap-2"
                                    >
                                        <span
                                            aria-hidden
                                            className={cn(
                                                'size-2.5 rounded-xs',
                                                shareColours[
                                                    index % shareColours.length
                                                ],
                                            )}
                                        />
                                        <span>{item.label}</span>
                                        <span className="font-medium tabular-nums">
                                            {item.percent}%
                                        </span>
                                        <span className="text-muted-foreground tabular-nums">
                                            ({item.orders})
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </>
                    )}
                </Panel>

                <Panel
                    title="Top faculties"
                    description="Packs sold, last 30 days"
                >
                    {top_faculties.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No packs sold in the last 30 days.
                        </p>
                    ) : (
                        <ol className="space-y-2">
                            {top_faculties.map((faculty) => (
                                <li
                                    key={faculty.name}
                                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_2.5rem] items-center gap-3 text-sm"
                                >
                                    <span className="truncate">
                                        {faculty.name}
                                    </span>
                                    <span
                                        aria-hidden
                                        className="h-1 rounded-full bg-stone"
                                    >
                                        <span
                                            className="block h-full rounded-full bg-ink"
                                            style={{
                                                width: `${(faculty.packs / maxPacks) * 100}%`,
                                            }}
                                        />
                                    </span>
                                    <span className="text-right tabular-nums">
                                        {faculty.packs}
                                    </span>
                                </li>
                            ))}
                        </ol>
                    )}
                </Panel>

                <Panel
                    title="Stock left"
                    description={`${stock_total} packs across all designs`}
                >
                    {stock.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No designs yet.
                        </p>
                    ) : (
                        <ul className="space-y-2">
                            {stock.map((design) => (
                                <li
                                    key={design.name}
                                    className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_2.5rem] items-center gap-3 text-sm"
                                >
                                    <span className="flex min-w-0 items-center gap-2">
                                        <span
                                            aria-hidden
                                            className="size-3 shrink-0 rounded-full border border-black/10"
                                            style={{
                                                backgroundColor: design.tint,
                                            }}
                                        />
                                        <span
                                            className={cn(
                                                'truncate',
                                                !design.active &&
                                                    'text-muted-foreground',
                                            )}
                                        >
                                            {design.name}
                                            {!design.active && ' (inactive)'}
                                        </span>
                                    </span>
                                    <span
                                        aria-hidden
                                        className="h-1 rounded-full bg-stone"
                                    >
                                        <span
                                            className={cn(
                                                'block h-full rounded-full',
                                                design.stock <= LOW_STOCK
                                                    ? 'bg-danger'
                                                    : 'bg-ink',
                                            )}
                                            style={{
                                                width: `${(design.stock / maxStock) * 100}%`,
                                            }}
                                        />
                                    </span>
                                    <span
                                        className={cn(
                                            'text-right tabular-nums',
                                            design.stock <= LOW_STOCK &&
                                                'font-medium text-danger',
                                        )}
                                    >
                                        {design.stock}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Panel>

                <Panel
                    title="Top traffic sources"
                    description="By orders, last 30 days"
                    bodyClassName="p-0"
                >
                    {top_sources.length === 0 ? (
                        <p className="p-4 text-sm text-muted-foreground">
                            No orders in the last 30 days.
                        </p>
                    ) : (
                        <table className="w-full border-collapse text-sm">
                            <caption className="sr-only">
                                Top traffic sources
                            </caption>
                            <thead>
                                <tr>
                                    <Th>Source / medium</Th>
                                    <Th numeric>Orders</Th>
                                    <Th numeric>Revenue</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_sources.map((row) => (
                                    <tr
                                        key={`${row.source}/${row.medium}`}
                                        className={rowClass}
                                    >
                                        <Td>
                                            {row.source}
                                            {row.medium && (
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    / {row.medium}
                                                </span>
                                            )}
                                        </Td>
                                        <Td numeric>{row.orders}</Td>
                                        <Td numeric>{row.revenue}</Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Panel>
            </div>

            <section className="space-y-3">
                <div className="flex items-baseline justify-between gap-3">
                    <h2 className="text-sm font-semibold">Recent orders</h2>
                    <Link
                        href={orders_url}
                        className="text-sm text-line underline-offset-4 hover:underline"
                    >
                        All orders
                    </Link>
                </div>
                {recent.length === 0 ? (
                    <EmptyState title="No orders yet">
                        New orders appear here as soon as they are placed.
                    </EmptyState>
                ) : (
                    <OrdersTable orders={recent} caption="Recent orders" />
                )}
            </section>
        </div>
    );
}
