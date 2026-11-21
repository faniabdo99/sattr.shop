import { Head, Link, router } from '@inertiajs/react';
import { Star } from 'lucide-react';
import { useState } from 'react';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { EmptyState } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import { pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';

type ReviewStatus = 'pending' | 'approved' | 'rejected';

type Review = {
    id: number;
    name: string | null;
    rating: number;
    body: string | null;
    locale: string | null;
    status: ReviewStatus;
    design: string | null;
    order_code: string | null;
    order_url: string | null;
    date: string | null;
    url: string;
};

type Filter = 'all' | ReviewStatus;

const filters: { key: Filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
];

function Rating({ value }: { value: number }) {
    return (
        <span
            className="inline-flex items-center gap-0.5"
            role="img"
            aria-label={`${value} out of 5`}
        >
            {[1, 2, 3, 4, 5].map((step) => (
                <Star
                    key={step}
                    aria-hidden
                    className={cn(
                        'size-3.5',
                        step <= value
                            ? 'fill-ink text-ink'
                            : 'fill-transparent text-stone',
                    )}
                />
            ))}
        </span>
    );
}

export default function Reviews({ reviews }: { reviews: Review[] }) {
    const [filter, setFilter] = useState<Filter>('all');
    const [busy, setBusy] = useState<number | null>(null);

    const count = (key: Filter) =>
        key === 'all'
            ? reviews.length
            : reviews.filter((review) => review.status === key).length;
    const visible =
        filter === 'all'
            ? reviews
            : reviews.filter((review) => review.status === filter);

    const moderate = (review: Review, status: ReviewStatus) =>
        router.put(
            review.url,
            { status },
            {
                preserveScroll: true,
                onStart: () => setBusy(review.id),
                onFinish: () => setBusy(null),
            },
        );

    const destroy = (review: Review) => {
        if (window.confirm('Delete this review? This cannot be undone.')) {
            router.delete(review.url, { preserveScroll: true });
        }
    };

    return (
        <div className={pageClass}>
            <Head title="Reviews" />
            <PageHeader
                title="Reviews"
                description="Only approved reviews appear on the storefront. Shows the latest 200."
            />

            <div
                role="group"
                aria-label="Filter reviews by status"
                className="flex gap-1 border-b border-border"
            >
                {filters.map((item) => (
                    <button
                        key={item.key}
                        type="button"
                        aria-pressed={filter === item.key}
                        onClick={() => setFilter(item.key)}
                        className={cn(
                            '-mb-px border-b-2 px-3 py-2 text-sm',
                            filter === item.key
                                ? 'border-line font-medium text-line'
                                : 'border-transparent text-muted-foreground hover:text-foreground',
                        )}
                    >
                        {item.label}{' '}
                        <span className="text-xs tabular-nums opacity-70">
                            {count(item.key)}
                        </span>
                    </button>
                ))}
            </div>

            {visible.length === 0 ? (
                <EmptyState
                    title={
                        reviews.length === 0
                            ? 'No reviews yet'
                            : `No ${filter} reviews`
                    }
                >
                    {reviews.length === 0 &&
                        'Reviews arrive after customers follow the review link sent with a delivered order.'}
                </EmptyState>
            ) : (
                <ul className="rounded-md border border-border bg-card">
                    {visible.map((review) => (
                        <li
                            key={review.id}
                            className="grid gap-3 border-b border-border p-4 last:border-b-0 md:grid-cols-[minmax(0,1fr)_auto]"
                        >
                            <div className="min-w-0 space-y-1.5">
                                <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    <Rating value={review.rating} />
                                    <span dir="auto" className="font-medium">
                                        {review.name || 'Anonymous'}
                                    </span>
                                    <StatusBadge value={review.status} />
                                </p>
                                {review.body ? (
                                    <p
                                        dir="auto"
                                        lang={review.locale ?? undefined}
                                        className="max-w-2xl text-sm whitespace-pre-line"
                                    >
                                        {review.body}
                                    </p>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        Rating only, no text.
                                    </p>
                                )}
                                <p className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                                    <span className="tabular-nums">
                                        {review.date}
                                    </span>
                                    {review.design && (
                                        <span>{review.design}</span>
                                    )}
                                    <span>
                                        {review.locale === 'ar'
                                            ? 'Arabic'
                                            : review.locale === 'en'
                                              ? 'English'
                                              : (review.locale ?? '')}
                                    </span>
                                    {review.order_url && (
                                        <Link
                                            href={review.order_url}
                                            className="text-line tabular-nums underline-offset-4 hover:underline"
                                        >
                                            Order {review.order_code}
                                        </Link>
                                    )}
                                </p>
                            </div>
                            <div className="flex flex-wrap items-start gap-2">
                                {review.status !== 'approved' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        disabled={busy === review.id}
                                        onClick={() =>
                                            moderate(review, 'approved')
                                        }
                                    >
                                        Approve
                                    </Button>
                                )}
                                {review.status !== 'rejected' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        disabled={busy === review.id}
                                        onClick={() =>
                                            moderate(review, 'rejected')
                                        }
                                    >
                                        Reject
                                    </Button>
                                )}
                                {review.status !== 'pending' && (
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="ghost"
                                        disabled={busy === review.id}
                                        onClick={() =>
                                            moderate(review, 'pending')
                                        }
                                    >
                                        Back to pending
                                    </Button>
                                )}
                                <Button
                                    type="button"
                                    size="sm"
                                    variant="ghost"
                                    className="text-danger hover:text-danger"
                                    onClick={() => destroy(review)}
                                >
                                    Delete
                                </Button>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
