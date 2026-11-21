import { Head, Link, router, useForm } from '@inertiajs/react';
import { Download } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import {
    controlClass,
    Field,
    FieldError,
    NativeSelect,
} from '@/components/admin/form';
import { OrdersTable } from '@/components/admin/orders-table';
import { PageHeader } from '@/components/admin/page-header';
import { EmptyState } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Option, OrderRow } from '@/types/admin';

type Filters = {
    search: string;
    status: string;
    payment_method: string;
    payment_status: string;
    design: string;
    governorate: string;
    from: string;
    to: string;
    flagged: boolean;
};

type Props = {
    orders: OrderRow[];
    pagination: {
        prev: string | null;
        next: string | null;
        from: number | null;
        to: number | null;
        total: number;
    };
    filters: Partial<Record<keyof Filters, string | null>>;
    options: {
        statuses: Option[];
        payment_methods: Option[];
        payment_statuses: Option[];
        designs: Option[];
        governorates: Option[];
    };
    urls: { index: string; export: string; bulk: string };
};

const inputClass = cn(controlClass, 'h-9 py-1');

function initial(filters: Props['filters']): Filters {
    return {
        search: filters.search ?? '',
        status: filters.status ?? '',
        payment_method: filters.payment_method ?? '',
        payment_status: filters.payment_status ?? '',
        design: filters.design ?? '',
        governorate: filters.governorate ?? '',
        from: filters.from ?? '',
        to: filters.to ?? '',
        flagged: Boolean(filters.flagged) && filters.flagged !== '0',
    };
}

export default function OrdersIndex({
    orders,
    pagination,
    filters,
    options,
    urls,
}: Props) {
    const [draft, setDraft] = useState<Filters>(() => initial(filters));
    const bulk = useForm<{ ids: number[]; status: string }>({
        ids: [],
        status: '',
    });

    const set = <K extends keyof Filters>(key: K, value: Filters[K]) =>
        setDraft((current) => ({ ...current, [key]: value }));

    const visit = (next: Filters) => {
        const query: Record<string, string> = {};

        for (const [key, value] of Object.entries(next)) {
            if (typeof value === 'string' && value.trim() !== '') {
                query[key] = value.trim();
            }
        }

        if (next.flagged) {
            query.flagged = '1';
        }

        bulk.setData('ids', []);
        router.get(urls.index, query, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const applyFilters = (event: FormEvent) => {
        event.preventDefault();
        visit(draft);
    };

    const reset = () => {
        const cleared = initial({});

        setDraft(cleared);
        visit(cleared);
    };

    const applyBulk = (event: FormEvent) => {
        event.preventDefault();

        const label =
            options.statuses.find((item) => item.value === bulk.data.status)
                ?.label ?? bulk.data.status;

        if (
            !window.confirm(
                `Mark ${bulk.data.ids.length} order(s) as ${label}? Customers may be notified.`,
            )
        ) {
            return;
        }

        bulk.post(urls.bulk, {
            preserveScroll: true,
            onSuccess: () => bulk.reset(),
        });
    };

    const hasFilters = Object.values(initial(filters)).some(Boolean);
    const selectedCount = bulk.data.ids.length;

    return (
        <div className={pageClass}>
            <Head title="Orders" />
            <PageHeader
                title="Orders"
                description={
                    pagination.total === 0
                        ? 'No orders match.'
                        : `${pagination.total} ${pagination.total === 1 ? 'order' : 'orders'}${hasFilters ? ' match the filters' : ''}.`
                }
                actions={
                    <Button asChild variant="outline" size="sm">
                        {/* A file download, so a plain link rather than an Inertia visit. */}
                        <a href={urls.export}>
                            <Download aria-hidden />
                            Export CSV
                        </a>
                    </Button>
                }
            />

            <form
                onSubmit={applyFilters}
                role="search"
                aria-label="Filter orders"
                className="grid gap-3 rounded-md border border-border bg-card p-4 sm:grid-cols-2 lg:grid-cols-4"
            >
                <Field
                    id="filter-search"
                    label="Search"
                    className="sm:col-span-2"
                >
                    <input
                        id="filter-search"
                        type="search"
                        value={draft.search}
                        placeholder="Order code, name or phone"
                        onChange={(event) => set('search', event.target.value)}
                        className={inputClass}
                    />
                </Field>
                <Field id="filter-status" label="Status">
                    <NativeSelect
                        id="filter-status"
                        value={draft.status}
                        onChange={(event) => set('status', event.target.value)}
                    >
                        <option value="">Any status</option>
                        {options.statuses.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <Field id="filter-design" label="Design">
                    <NativeSelect
                        id="filter-design"
                        value={draft.design}
                        onChange={(event) => set('design', event.target.value)}
                    >
                        <option value="">Any design</option>
                        {options.designs.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <Field id="filter-method" label="Payment method">
                    <NativeSelect
                        id="filter-method"
                        value={draft.payment_method}
                        onChange={(event) =>
                            set('payment_method', event.target.value)
                        }
                    >
                        <option value="">Any method</option>
                        {options.payment_methods.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <Field id="filter-payment" label="Payment status">
                    <NativeSelect
                        id="filter-payment"
                        value={draft.payment_status}
                        onChange={(event) =>
                            set('payment_status', event.target.value)
                        }
                    >
                        <option value="">Any payment status</option>
                        {options.payment_statuses.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <Field id="filter-governorate" label="Governorate">
                    <NativeSelect
                        id="filter-governorate"
                        value={draft.governorate}
                        onChange={(event) =>
                            set('governorate', event.target.value)
                        }
                    >
                        <option value="">Any governorate</option>
                        {options.governorates.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                    <Field id="filter-from" label="From">
                        <input
                            id="filter-from"
                            type="date"
                            value={draft.from}
                            max={draft.to || undefined}
                            onChange={(event) =>
                                set('from', event.target.value)
                            }
                            className={inputClass}
                        />
                    </Field>
                    <Field id="filter-to" label="To">
                        <input
                            id="filter-to"
                            type="date"
                            value={draft.to}
                            min={draft.from || undefined}
                            onChange={(event) => set('to', event.target.value)}
                            className={inputClass}
                        />
                    </Field>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
                    <label
                        htmlFor="filter-flagged"
                        className="flex items-center gap-2 text-sm"
                    >
                        <input
                            id="filter-flagged"
                            type="checkbox"
                            checked={draft.flagged}
                            onChange={(event) =>
                                set('flagged', event.target.checked)
                            }
                            className="size-4 accent-line"
                        />
                        Flagged only (unpaid InstaPay)
                    </label>
                    <div className="flex items-center gap-2">
                        {hasFilters && (
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={reset}
                            >
                                Clear filters
                            </Button>
                        )}
                        <Button type="submit" size="sm">
                            Apply filters
                        </Button>
                    </div>
                </div>
            </form>

            {orders.length === 0 ? (
                <EmptyState
                    title={
                        hasFilters
                            ? 'No orders match these filters'
                            : 'No orders yet'
                    }
                >
                    {hasFilters ? (
                        <button
                            type="button"
                            onClick={reset}
                            className="text-line underline underline-offset-4"
                        >
                            Clear the filters
                        </button>
                    ) : (
                        'Orders appear here as soon as customers place them.'
                    )}
                </EmptyState>
            ) : (
                <div className="space-y-3">
                    <form
                        onSubmit={applyBulk}
                        className="flex flex-wrap items-center gap-2 text-sm"
                    >
                        <span
                            aria-live="polite"
                            className="text-muted-foreground tabular-nums"
                        >
                            {selectedCount} selected
                        </span>
                        <label htmlFor="bulk-status" className="sr-only">
                            New status for the selected orders
                        </label>
                        <NativeSelect
                            id="bulk-status"
                            value={bulk.data.status}
                            onChange={(event) =>
                                bulk.setData('status', event.target.value)
                            }
                            className="h-8 w-auto"
                        >
                            <option value="">Set status to…</option>
                            {options.statuses.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </NativeSelect>
                        <Button
                            type="submit"
                            size="sm"
                            variant="outline"
                            disabled={
                                bulk.processing ||
                                selectedCount === 0 ||
                                bulk.data.status === ''
                            }
                        >
                            Update selected
                        </Button>
                        <FieldError
                            message={bulk.errors.ids ?? bulk.errors.status}
                        />
                    </form>

                    <OrdersTable
                        orders={orders}
                        caption="Orders"
                        selection={{
                            ids: bulk.data.ids,
                            onChange: (ids) => bulk.setData('ids', ids),
                        }}
                    />

                    <nav
                        aria-label="Pagination"
                        className="flex items-center justify-between gap-3 text-sm"
                    >
                        <span className="text-muted-foreground tabular-nums">
                            {pagination.from}–{pagination.to} of{' '}
                            {pagination.total}
                        </span>
                        <span className="flex gap-2">
                            {pagination.prev ? (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={pagination.prev}>Previous</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Previous
                                </Button>
                            )}
                            {pagination.next ? (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={pagination.next}>Next</Link>
                                </Button>
                            ) : (
                                <Button variant="outline" size="sm" disabled>
                                    Next
                                </Button>
                            )}
                        </span>
                    </nav>
                </div>
            )}
        </div>
    );
}
