import { Head, router, useForm } from '@inertiajs/react';
import { Flag, MessageCircle, Phone, Printer } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { useState } from 'react';
import {
    controlClass,
    CopyField,
    Field,
    NativeSelect,
    Panel,
    Textarea,
} from '@/components/admin/form';
import { PageHeader } from '@/components/admin/page-header';
import { StatusBadge } from '@/components/admin/status-badge';
import { rowClass, Td } from '@/components/admin/table';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { pageClass } from '@/lib/admin';
import { cn } from '@/lib/utils';
import type { Option, OrderRow } from '@/types/admin';

type Order = OrderRow & {
    alt_phone: string | null;
    email: string | null;
    city: string | null;
    address: string;
    notes: string | null;
    locale: string;
    subtotal_label: string;
    discount_label: string;
    cod_label: string;
    gift_message: string | null;
    tint: string | null;
    paid_at: string | null;
    verified_by: string | null;
    payment_reference: string | null;
    flagged_at: string | null;
    internal_notes: string | null;
    bosta_tracking_number: string | null;
    ip: string | null;
    user_agent: string | null;
    attribution: Record<string, string> | never[];
    status_url: string;
    whatsapp_url: string;
    review: { rating: number; status: string } | null;
    review_url: string;
};

type Payment = {
    id: number;
    status: string;
    reference: string | null;
    rejection_reason: string | null;
    created_at: string | null;
    verifier: string | null;
    proof_url: string | null;
};

type HistoryEntry = {
    id: number;
    from: string | null;
    to: string;
    note: string | null;
    by: string | null;
    at: string | null;
};

type Props = {
    order: Order;
    payments: Payment[];
    history: HistoryEntry[];
    options: { statuses: Option[]; payment_statuses: Option[] };
    urls: {
        index: string;
        update: string;
        verify: string;
        reject: string;
        slip: string;
    };
};

const attributionLabels: Record<string, string> = {
    utm_source: 'UTM source',
    utm_medium: 'UTM medium',
    utm_campaign: 'UTM campaign',
    utm_term: 'UTM term',
    utm_content: 'UTM content',
    gclid: 'Google click ID',
    fbclid: 'Meta click ID',
    ttclid: 'TikTok click ID',
    referrer: 'Referrer',
    landing_page: 'Landing page',
};

function Item({
    label,
    children,
    className,
}: {
    label: string;
    children: ReactNode;
    className?: string;
}) {
    return (
        <div className={className}>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-sm break-words">{children}</dd>
        </div>
    );
}

function ProofViewer({ payment }: { payment: Payment }) {
    if (!payment.proof_url) {
        return (
            <span className="flex size-20 shrink-0 items-center justify-center rounded-sm border border-dashed border-border text-center text-xs text-muted-foreground">
                No proof
            </span>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="block size-20 shrink-0 overflow-hidden rounded-sm border border-border bg-paper"
                    aria-label="View payment proof at full size"
                >
                    <img
                        src={payment.proof_url}
                        alt="Payment proof thumbnail"
                        className="size-full object-cover"
                    />
                </button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Payment proof</DialogTitle>
                    <DialogDescription>
                        Submitted {payment.created_at ?? ''}
                        {payment.reference &&
                            ` · reference ${payment.reference}`}
                    </DialogDescription>
                </DialogHeader>
                <div className="max-h-[70vh] overflow-auto rounded-sm bg-paper">
                    <img
                        src={payment.proof_url}
                        alt="Payment proof submitted by the customer"
                        className="mx-auto h-auto max-w-full"
                    />
                </div>
                <DialogFooter>
                    <Button asChild variant="outline" size="sm">
                        <a
                            href={payment.proof_url}
                            target="_blank"
                            rel="noreferrer"
                        >
                            Open original in a new tab
                        </a>
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

function RejectDialog({ url }: { url: string }) {
    const [open, setOpen] = useState(false);
    const form = useForm({ reason: '' });

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.post(url, {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-danger hover:text-danger"
                >
                    Reject
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={submit} className="grid gap-4">
                    <DialogHeader>
                        <DialogTitle>Reject payment proof</DialogTitle>
                        <DialogDescription>
                            The customer is notified with this reason and asked
                            to send a new proof.
                        </DialogDescription>
                    </DialogHeader>
                    <Field
                        id="reject-reason"
                        label="Reason"
                        error={form.errors.reason}
                        hint="Written for the customer. 5 to 500 characters."
                    >
                        <Textarea
                            id="reject-reason"
                            rows={4}
                            required
                            minLength={5}
                            maxLength={500}
                            dir="auto"
                            value={form.data.reason}
                            onChange={(event) =>
                                form.setData('reason', event.target.value)
                            }
                        />
                    </Field>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="destructive"
                            disabled={form.processing}
                        >
                            Reject payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

type StatusFormProps = { status: string; options: Option[]; url: string };

/** Keyed by the current status, so it resets when the server changes it. */
function StatusForm({ status, options, url }: StatusFormProps) {
    const statusForm = useForm({ status, status_note: '' });

    const saveStatus = (event: FormEvent) => {
        event.preventDefault();
        statusForm.patch(url, {
            preserveScroll: true,
            onSuccess: () => statusForm.setData('status_note', ''),
        });
    };

    return (
        <Panel title="Order status">
            <form onSubmit={saveStatus} className="space-y-4">
                <Field
                    id="order-status"
                    label="Status"
                    error={statusForm.errors.status}
                >
                    <NativeSelect
                        id="order-status"
                        value={statusForm.data.status}
                        onChange={(event) =>
                            statusForm.setData('status', event.target.value)
                        }
                    >
                        {options.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <Field
                    id="order-status-note"
                    label="Note (optional)"
                    error={statusForm.errors.status_note}
                    hint="Saved in the history log."
                >
                    <Textarea
                        id="order-status-note"
                        rows={2}
                        maxLength={500}
                        value={statusForm.data.status_note}
                        onChange={(event) =>
                            statusForm.setData(
                                'status_note',
                                event.target.value,
                            )
                        }
                    />
                </Field>
                <Button
                    type="submit"
                    size="sm"
                    disabled={statusForm.processing}
                >
                    Update status
                </Button>
            </form>
        </Panel>
    );
}

function PaymentStatusForm({ status, options, url }: StatusFormProps) {
    const paymentForm = useForm({ payment_status: status });

    const savePayment = (event: FormEvent) => {
        event.preventDefault();
        paymentForm.patch(url, { preserveScroll: true });
    };

    return (
        <Panel
            title="Payment status"
            description="Manual override. Use Verify payment for InstaPay proofs."
        >
            <form onSubmit={savePayment} className="space-y-4">
                <Field
                    id="order-payment-status"
                    label="Payment status"
                    error={paymentForm.errors.payment_status}
                >
                    <NativeSelect
                        id="order-payment-status"
                        value={paymentForm.data.payment_status}
                        onChange={(event) =>
                            paymentForm.setData(
                                'payment_status',
                                event.target.value,
                            )
                        }
                    >
                        {options.map((item) => (
                            <option key={item.value} value={item.value}>
                                {item.label}
                            </option>
                        ))}
                    </NativeSelect>
                </Field>
                <Button
                    type="submit"
                    size="sm"
                    variant="outline"
                    disabled={paymentForm.processing}
                >
                    Save payment status
                </Button>
            </form>
        </Panel>
    );
}

export default function OrderShow({
    order,
    payments,
    history,
    options,
    urls,
}: Props) {
    const notesForm = useForm({
        internal_notes: order.internal_notes ?? '',
        bosta_tracking_number: order.bosta_tracking_number ?? '',
    });
    const [verifying, setVerifying] = useState(false);

    const attribution = Object.entries(
        Array.isArray(order.attribution) ? {} : order.attribution,
    );
    const isPaid = order.payment_status === 'paid';
    const canVerify = !isPaid && order.payment_method === 'instapay';
    const canReject = order.payment_status === 'awaiting_verification';

    const verify = () => {
        if (
            !window.confirm(
                `Mark order ${order.code} as paid (${order.total_label})? The customer is notified.`,
            )
        ) {
            return;
        }

        router.post(
            urls.verify,
            {},
            {
                preserveScroll: true,
                onStart: () => setVerifying(true),
                onFinish: () => setVerifying(false),
            },
        );
    };

    const saveNotes = (event: FormEvent) => {
        event.preventDefault();
        notesForm.patch(urls.update, { preserveScroll: true });
    };

    return (
        <div className={pageClass}>
            <Head title={`Order ${order.code}`} />
            <PageHeader
                title={`Order ${order.code}`}
                back={{ href: urls.index, label: 'Orders' }}
                description={
                    <span className="flex flex-wrap items-center gap-2">
                        <span className="tabular-nums">
                            Placed {order.created_at}
                        </span>
                        <StatusBadge
                            value={order.status}
                            label={order.status_label}
                        />
                        <StatusBadge
                            value={order.payment_status}
                            label={order.payment_status_label}
                        />
                        {order.flagged && (
                            <StatusBadge value="flagged" label="Flagged" />
                        )}
                    </span>
                }
                actions={
                    <Button asChild variant="outline" size="sm">
                        <a href={urls.slip} target="_blank" rel="noreferrer">
                            <Printer aria-hidden />
                            Print packing slip
                        </a>
                    </Button>
                }
            />

            {order.flagged && (
                <p className="flex items-start gap-2 rounded-md border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
                    <Flag className="mt-0.5 size-4 shrink-0" aria-hidden />
                    <span>
                        Flagged {order.flagged_at}: this InstaPay order is still
                        unpaid. Contact the customer or cancel the order.
                    </span>
                </p>
            )}

            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                <div className="min-w-0 space-y-6">
                    <Panel
                        title="Customer"
                        actions={
                            <span className="flex gap-2">
                                <Button asChild variant="outline" size="sm">
                                    <a href={`tel:${order.phone}`}>
                                        <Phone aria-hidden />
                                        Call
                                    </a>
                                </Button>
                                <Button asChild variant="outline" size="sm">
                                    <a
                                        href={order.whatsapp_url}
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        <MessageCircle aria-hidden />
                                        WhatsApp
                                    </a>
                                </Button>
                            </span>
                        }
                    >
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Item label="Name">
                                <span dir="auto">{order.customer_name}</span>
                            </Item>
                            <Item label="Phone">
                                <a
                                    href={`tel:${order.phone}`}
                                    className="tabular-nums underline-offset-4 hover:underline"
                                >
                                    {order.phone}
                                </a>
                                {order.alt_phone && (
                                    <>
                                        {' · '}
                                        <a
                                            href={`tel:${order.alt_phone}`}
                                            className="tabular-nums underline-offset-4 hover:underline"
                                        >
                                            {order.alt_phone}
                                        </a>
                                        <span className="text-muted-foreground">
                                            {' '}
                                            (alt)
                                        </span>
                                    </>
                                )}
                            </Item>
                            <Item label="Email">
                                {order.email ? (
                                    <a
                                        href={`mailto:${order.email}`}
                                        className="underline-offset-4 hover:underline"
                                    >
                                        {order.email}
                                    </a>
                                ) : (
                                    '—'
                                )}
                            </Item>
                            <Item label="Language">
                                {order.locale === 'ar' ? 'Arabic' : 'English'}
                            </Item>
                            <Item label="Address" className="sm:col-span-2">
                                <span dir="auto" className="block">
                                    {order.address}
                                </span>
                                <span className="block text-muted-foreground">
                                    <span dir="auto">{order.city}</span>
                                    {order.city && ', '}
                                    {order.governorate}
                                </span>
                            </Item>
                            {order.notes && (
                                <Item
                                    label="Delivery notes"
                                    className="sm:col-span-2"
                                >
                                    <span
                                        dir="auto"
                                        className="block whitespace-pre-line"
                                    >
                                        {order.notes}
                                    </span>
                                </Item>
                            )}
                        </dl>
                        <CopyField
                            label="Customer status link"
                            value={order.status_url}
                        />
                    </Panel>

                    <Panel title="Pack">
                        <dl className="grid gap-4 sm:grid-cols-2">
                            <Item label="Design">
                                <span className="flex items-center gap-2">
                                    {order.tint && (
                                        <span
                                            aria-hidden
                                            className="size-3 rounded-full border border-black/10"
                                            style={{
                                                backgroundColor: order.tint,
                                            }}
                                        />
                                    )}
                                    {order.design ?? '—'}
                                </span>
                            </Item>
                            <Item label="Quantity">
                                <span className="tabular-nums">
                                    {order.quantity ?? '—'}
                                </span>
                            </Item>
                            <Item
                                label="Gift message"
                                className="sm:col-span-2"
                            >
                                {order.gift_message ? (
                                    <span
                                        dir="auto"
                                        className="block whitespace-pre-line"
                                    >
                                        {order.gift_message}
                                    </span>
                                ) : (
                                    '—'
                                )}
                            </Item>
                        </dl>
                    </Panel>

                    <Panel
                        title="Payment"
                        description={`${order.payment_method_label} · ${order.payment_status_label}`}
                        actions={
                            (canVerify || canReject) && (
                                <span className="flex gap-2">
                                    {canReject && (
                                        <RejectDialog url={urls.reject} />
                                    )}
                                    {canVerify && (
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="bg-line text-white hover:bg-line-deep"
                                            disabled={verifying}
                                            onClick={verify}
                                        >
                                            Verify payment
                                        </Button>
                                    )}
                                </span>
                            )
                        }
                    >
                        <dl className="grid gap-4 sm:grid-cols-3">
                            <Item label="Paid at">
                                <span className="tabular-nums">
                                    {order.paid_at ?? '—'}
                                </span>
                            </Item>
                            <Item label="Verified by">
                                {order.verified_by ?? '—'}
                            </Item>
                            <Item label="Payment reference">
                                {order.payment_reference ?? '—'}
                            </Item>
                        </dl>

                        <div>
                            <h3 className="mb-2 text-xs font-medium text-muted-foreground">
                                Proof submissions
                            </h3>
                            {payments.length === 0 ? (
                                <p className="text-sm text-muted-foreground">
                                    {order.payment_method === 'instapay'
                                        ? 'The customer has not sent a payment proof yet.'
                                        : 'Cash on delivery: no proof needed.'}
                                </p>
                            ) : (
                                <ul>
                                    {payments.map((payment) => (
                                        <li
                                            key={payment.id}
                                            className="flex gap-3 border-b border-border py-3 first:pt-0 last:border-b-0 last:pb-0"
                                        >
                                            <ProofViewer payment={payment} />
                                            <div className="min-w-0 space-y-1 text-sm">
                                                <p className="flex flex-wrap items-center gap-2">
                                                    <StatusBadge
                                                        value={payment.status}
                                                    />
                                                    <span className="text-muted-foreground tabular-nums">
                                                        {payment.created_at}
                                                    </span>
                                                </p>
                                                {payment.reference && (
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            Reference:{' '}
                                                        </span>
                                                        {payment.reference}
                                                    </p>
                                                )}
                                                {payment.verifier && (
                                                    <p>
                                                        <span className="text-muted-foreground">
                                                            Reviewed by:{' '}
                                                        </span>
                                                        {payment.verifier}
                                                    </p>
                                                )}
                                                {payment.rejection_reason && (
                                                    <p
                                                        dir="auto"
                                                        className="text-danger"
                                                    >
                                                        {
                                                            payment.rejection_reason
                                                        }
                                                    </p>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </Panel>

                    <Panel title="History">
                        {history.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                No status changes recorded.
                            </p>
                        ) : (
                            <ol className="space-y-3">
                                {history.map((entry) => (
                                    <li
                                        key={entry.id}
                                        className="grid gap-x-4 gap-y-0.5 text-sm sm:grid-cols-[9.5rem_1fr]"
                                    >
                                        <time className="text-xs leading-5 text-muted-foreground tabular-nums">
                                            {entry.at}
                                        </time>
                                        <div>
                                            <p>
                                                {entry.from && (
                                                    <>
                                                        <span className="text-muted-foreground">
                                                            {entry.from}
                                                        </span>
                                                        {' → '}
                                                    </>
                                                )}
                                                <span className="font-medium">
                                                    {entry.to}
                                                </span>
                                                <span className="text-muted-foreground">
                                                    {' '}
                                                    · {entry.by ?? 'System'}
                                                </span>
                                            </p>
                                            {entry.note && (
                                                <p
                                                    dir="auto"
                                                    className="text-muted-foreground"
                                                >
                                                    {entry.note}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </Panel>

                    <Panel title="Attribution" bodyClassName="p-0 space-y-0">
                        {attribution.length === 0 ? (
                            <p className="p-4 text-sm text-muted-foreground">
                                No campaign data: a direct visit.
                            </p>
                        ) : (
                            <table className="w-full border-collapse text-sm">
                                <caption className="sr-only">
                                    Attribution
                                </caption>
                                <tbody>
                                    {attribution.map(([key, value]) => (
                                        <tr key={key} className={rowClass}>
                                            <th
                                                scope="row"
                                                className="w-40 px-4 py-2 text-left align-top text-xs font-medium text-muted-foreground"
                                            >
                                                {attributionLabels[key] ?? key}
                                            </th>
                                            <Td className="py-2 break-all">
                                                {value}
                                            </Td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                        <dl className="grid gap-4 border-t border-border p-4 sm:grid-cols-[10rem_1fr]">
                            <Item label="IP address">
                                <span className="tabular-nums">
                                    {order.ip ?? '—'}
                                </span>
                            </Item>
                            <Item label="User agent">
                                <span className="text-xs break-all text-muted-foreground">
                                    {order.user_agent ?? '—'}
                                </span>
                            </Item>
                        </dl>
                    </Panel>
                </div>

                <div className="min-w-0 space-y-6">
                    <Panel title="Totals">
                        <dl className="space-y-1.5 text-sm">
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    Subtotal
                                </dt>
                                <dd className="tabular-nums">
                                    {order.subtotal_label}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    Discount
                                </dt>
                                <dd className="tabular-nums">
                                    −{order.discount_label}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-3 border-t border-border pt-1.5 font-semibold">
                                <dt>Total</dt>
                                <dd className="tabular-nums">
                                    {order.total_label}
                                </dd>
                            </div>
                            <div className="flex justify-between gap-3">
                                <dt className="text-muted-foreground">
                                    To collect on delivery
                                </dt>
                                <dd className="tabular-nums">
                                    {order.cod_label}
                                </dd>
                            </div>
                        </dl>
                    </Panel>

                    <StatusForm
                        key={`status-${order.status}`}
                        status={order.status}
                        options={options.statuses}
                        url={urls.update}
                    />

                    <PaymentStatusForm
                        key={`payment-${order.payment_status}`}
                        status={order.payment_status}
                        options={options.payment_statuses}
                        url={urls.update}
                    />

                    <Panel title="Fulfilment notes">
                        <form onSubmit={saveNotes} className="space-y-4">
                            <Field
                                id="order-tracking"
                                label="Bosta tracking number"
                                error={notesForm.errors.bosta_tracking_number}
                            >
                                <input
                                    id="order-tracking"
                                    value={notesForm.data.bosta_tracking_number}
                                    maxLength={60}
                                    onChange={(event) =>
                                        notesForm.setData(
                                            'bosta_tracking_number',
                                            event.target.value,
                                        )
                                    }
                                    className={cn(
                                        controlClass,
                                        'h-9 py-1 tabular-nums',
                                    )}
                                />
                            </Field>
                            <Field
                                id="order-notes"
                                label="Internal notes"
                                error={notesForm.errors.internal_notes}
                                hint="Never shown to the customer."
                            >
                                <Textarea
                                    id="order-notes"
                                    rows={4}
                                    dir="auto"
                                    maxLength={5000}
                                    value={notesForm.data.internal_notes}
                                    onChange={(event) =>
                                        notesForm.setData(
                                            'internal_notes',
                                            event.target.value,
                                        )
                                    }
                                />
                            </Field>
                            <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                disabled={notesForm.processing}
                            >
                                Save notes
                            </Button>
                        </form>
                    </Panel>

                    <Panel title="Review">
                        {order.review ? (
                            <p className="flex flex-wrap items-center gap-2 text-sm">
                                <span className="tabular-nums">
                                    {order.review.rating} / 5
                                </span>
                                <StatusBadge value={order.review.status} />
                            </p>
                        ) : (
                            <p className="text-sm text-muted-foreground">
                                No review yet.
                            </p>
                        )}
                        <CopyField
                            label="Review request link"
                            value={order.review_url}
                        />
                    </Panel>
                </div>
            </div>
        </div>
    );
}
