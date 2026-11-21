import { useForm } from '@inertiajs/react';
import { Check, Copy, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { DragEvent, FormEvent } from 'react';
import { Button, buttonClasses } from '@/components/brand/Button';
import { NibLoader } from '@/components/brand/Nib';
import { SignatureLine } from '@/components/brand/SignatureLine';
import { TextField } from '@/components/site/fields';
import { Notebook } from '@/components/site/notebook';
import { useSite, useT } from '@/hooks/use-t';
import { localDigits } from '@/lib/money';
import { track } from '@/lib/track';
import { cn } from '@/lib/utils';

type Props = {
    order: {
        code: string;
        customer_name: string;
        status: string;
        status_label: string;
        closed: boolean;
        payment_method: 'instapay' | 'cod';
        payment_method_label: string;
        payment_status:
            | 'unpaid'
            | 'awaiting_verification'
            | 'paid'
            | 'refunded';
        payment_status_label: string;
        subtotal_label: string;
        discount: number;
        discount_label: string;
        total: number;
        total_label: string;
        amount_plain: string;
        address: string;
        phone: string;
        tracking_number: string | null;
        item: {
            product: string;
            design: string;
            design_key: string | null;
            tint: string | null;
            quantity: number;
            gift_message: string | null;
        } | null;
    };
    timeline: {
        key: string;
        label: string;
        reached: boolean;
        date: string | null;
    }[];
    instapay: {
        ipa: string | null;
        phone: string | null;
        qr: string | null;
        can_submit: boolean;
        rejection: string | null;
        proof_url: string;
    } | null;
    whatsapp: string | null;
    purchase: {
        event_id: string;
        transaction_id: string;
        value: number;
        payment_type: string;
    } | null;
};

function CopyRow({
    field,
    label,
    value,
    copyValue,
    ltr = true,
}: {
    /** Reported with the "payment_details_copied" event. */
    field: 'amount' | 'ipa' | 'phone';
    label: string;
    value: string;
    copyValue?: string;
    ltr?: boolean;
}) {
    const t = useT();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(copyValue ?? value);
            setCopied(true);
            track('payment_details_copied', { field });
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 border-t border-sand py-4">
            <div className="min-w-0">
                <dt className="text-caption text-ink-muted">{label}</dt>
                <dd
                    className="price mt-1 text-body-l break-all"
                    dir={ltr ? 'ltr' : undefined}
                >
                    {value}
                </dd>
            </div>
            <button
                type="button"
                onClick={copy}
                className={cn(buttonClasses('secondary'), 'h-11 shrink-0 px-4')}
            >
                {copied ? (
                    <Check size={20} strokeWidth={1.5} aria-hidden="true" />
                ) : (
                    <Copy size={20} strokeWidth={1.5} aria-hidden="true" />
                )}
                <span aria-live="polite">
                    {copied ? t('order.copied') : t('order.copy')}
                </span>
            </button>
        </div>
    );
}

function Notice({
    tone,
    children,
}: {
    tone: 'success' | 'line' | 'ink';
    children: string;
}) {
    return (
        <p
            role="status"
            className={cn(
                'rounded-lg border bg-paper-raised p-4 text-body-l md:p-6',
                tone === 'success'
                    ? 'border-success'
                    : tone === 'line'
                      ? 'border-line'
                      : 'border-ink',
            )}
        >
            {children}
        </p>
    );
}

export default function OrderPage({
    order,
    timeline,
    instapay,
    whatsapp,
    purchase,
}: Props) {
    const t = useT();
    const { locale } = useSite();
    const form = useForm<{ proof: File | null; reference: string }>({
        proof: null,
        reference: '',
    });
    const [dragging, setDragging] = useState(false);

    useEffect(() => {
        if (!purchase) {
            return;
        }

        const key = `sattr_purchase_${purchase.transaction_id}`;

        if (window.sessionStorage.getItem(key)) {
            return;
        }

        window.sessionStorage.setItem(key, '1');
        track('purchase', {
            event_id: purchase.event_id,
            transaction_id: purchase.transaction_id,
            value: purchase.value,
            payment_type: purchase.payment_type,
            items: order.item
                ? [
                      {
                          item_id: `gift-pack-${order.item.design_key ?? ''}`,
                          item_name: order.item.product,
                          item_variant: order.item.design,
                          price: purchase.value / order.item.quantity,
                          quantity: order.item.quantity,
                      },
                  ]
                : [],
        });
    }, [purchase, order.item]);

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (instapay) {
            form.post(instapay.proof_url, {
                forceFormData: true,
                preserveScroll: true,
            });
        }
    };

    const drop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        setDragging(false);

        const file = event.dataTransfer.files?.[0];

        if (file) {
            form.setData('proof', file);
        }
    };

    const hasDetails = Boolean(
        instapay?.ipa || instapay?.phone || instapay?.qr,
    );

    return (
        <div className="wrap pt-12 pb-24">
            <header>
                <NibLoader size={72} once />
                <h1 className="display mt-4 text-display-l">
                    {t('order.thanks', { name: order.customer_name })}
                </h1>
                <p className="mt-8 overline">{t('order.code_label')}</p>
                <p className="display mt-1 text-display-m" dir="ltr">
                    {order.code}
                </p>
                <p className="mt-3 text-caption text-ink-muted">
                    {t('order.save_link')}
                </p>
            </header>

            <div className="mt-12 grid gap-x-8 gap-y-12 lg:grid-cols-12">
                <div className="flex flex-col gap-12 lg:col-span-7">
                    {/* Payment */}
                    <section
                        aria-labelledby="payment-title"
                        className="flex flex-col gap-6"
                    >
                        <h2 id="payment-title" className="sr-only">
                            {t('order.payment_title')}
                        </h2>

                        {order.payment_status === 'paid' && (
                            <Notice tone="success">{t('order.paid')}</Notice>
                        )}

                        {order.payment_status === 'refunded' && (
                            <Notice tone="ink">{t('order.refunded')}</Notice>
                        )}

                        {order.payment_method === 'cod' &&
                            order.payment_status === 'unpaid' &&
                            !order.closed && (
                                <Notice tone="ink">
                                    {t('order.cod_note', {
                                        amount: order.total_label,
                                    })}
                                </Notice>
                            )}

                        {instapay &&
                            order.payment_status ===
                                'awaiting_verification' && (
                                <Notice tone="line">
                                    {t('order.proof_received')}
                                </Notice>
                            )}

                        {instapay &&
                            order.payment_status === 'unpaid' &&
                            !order.closed && (
                                <>
                                    {/* InstaPay instructions card */}
                                    <div className="rounded-lg border border-sand bg-paper-raised p-4 md:p-6">
                                        <h3 className="text-title">
                                            {t('order.pay_title', {
                                                amount: order.total_label,
                                            })}
                                        </h3>
                                        <p className="mt-2 max-w-lg text-ink-muted">
                                            {t('order.pay_body')}
                                        </p>

                                        {hasDetails ? (
                                            <div className="mt-6 grid gap-6 sm:grid-cols-[1fr_auto]">
                                                <dl>
                                                    <CopyRow
                                                        field="amount"
                                                        label={t(
                                                            'order.amount',
                                                        )}
                                                        value={
                                                            order.total_label
                                                        }
                                                        copyValue={
                                                            order.amount_plain
                                                        }
                                                        ltr={false}
                                                    />
                                                    {instapay.ipa && (
                                                        <CopyRow
                                                            field="ipa"
                                                            label={t(
                                                                'order.ipa',
                                                            )}
                                                            value={instapay.ipa}
                                                        />
                                                    )}
                                                    {instapay.phone && (
                                                        <CopyRow
                                                            field="phone"
                                                            label={t(
                                                                'order.phone',
                                                            )}
                                                            value={
                                                                instapay.phone
                                                            }
                                                        />
                                                    )}
                                                </dl>
                                                {instapay.qr && (
                                                    <img
                                                        src={instapay.qr}
                                                        alt={t('order.qr_alt')}
                                                        width={176}
                                                        height={176}
                                                        className="size-44 rounded-sm border border-sand bg-white p-2"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-6 border-t border-sand pt-4">
                                                {t('order.instapay_missing')}
                                            </p>
                                        )}
                                    </div>

                                    {instapay.can_submit && (
                                        <form
                                            onSubmit={submit}
                                            className="flex flex-col gap-6"
                                            noValidate
                                        >
                                            <h3 className="text-title">
                                                {t('order.proof_title')}
                                            </h3>

                                            {instapay.rejection && (
                                                <p
                                                    role="alert"
                                                    className="rounded-sm border border-danger bg-paper-raised p-4 text-danger"
                                                >
                                                    {t('order.proof_rejected', {
                                                        reason: instapay.rejection,
                                                    })}
                                                </p>
                                            )}

                                            {/* Upload dropzone */}
                                            <div>
                                                <label
                                                    htmlFor="proof"
                                                    onDragOver={(event) => {
                                                        event.preventDefault();
                                                        setDragging(true);
                                                    }}
                                                    onDragLeave={() =>
                                                        setDragging(false)
                                                    }
                                                    onDrop={drop}
                                                    className={cn(
                                                        'flex cursor-pointer flex-col items-center gap-3 rounded-lg border-[1.5px] border-dashed px-6 py-10 text-center transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-line',
                                                        dragging
                                                            ? 'border-ink bg-paper-raised'
                                                            : 'border-sand hover:border-ink-muted',
                                                        form.errors.proof &&
                                                            'border-danger',
                                                    )}
                                                >
                                                    <Upload
                                                        size={24}
                                                        strokeWidth={1.5}
                                                        aria-hidden="true"
                                                    />
                                                    <span className="text-label">
                                                        {t('order.proof_file')}
                                                    </span>
                                                    <span className="text-caption text-ink-muted">
                                                        {form.data.proof
                                                            ? t(
                                                                  'order.proof_chosen',
                                                                  {
                                                                      name: form
                                                                          .data
                                                                          .proof
                                                                          .name,
                                                                  },
                                                              )
                                                            : t(
                                                                  'order.proof_drop',
                                                              )}
                                                    </span>
                                                    <input
                                                        id="proof"
                                                        type="file"
                                                        accept="image/*"
                                                        aria-describedby="proof-help"
                                                        aria-invalid={
                                                            form.errors.proof
                                                                ? true
                                                                : undefined
                                                        }
                                                        onChange={(event) =>
                                                            form.setData(
                                                                'proof',
                                                                event.target
                                                                    .files?.[0] ??
                                                                    null,
                                                            )
                                                        }
                                                        className="sr-only"
                                                    />
                                                </label>
                                                <p
                                                    id="proof-help"
                                                    className={cn(
                                                        'mt-2 text-caption',
                                                        form.errors.proof
                                                            ? 'text-danger'
                                                            : 'text-ink-muted',
                                                    )}
                                                >
                                                    {form.errors.proof ??
                                                        t(
                                                            'order.proof_file_hint',
                                                        )}
                                                </p>
                                            </div>

                                            <TextField
                                                label={t(
                                                    'order.proof_reference',
                                                )}
                                                optional={t('product.optional')}
                                                dir="ltr"
                                                maxLength={60}
                                                value={form.data.reference}
                                                onChange={(event) =>
                                                    form.setData(
                                                        'reference',
                                                        event.target.value,
                                                    )
                                                }
                                                error={form.errors.reference}
                                            />

                                            {form.progress && (
                                                <div
                                                    role="progressbar"
                                                    aria-valuenow={
                                                        form.progress
                                                            .percentage ?? 0
                                                    }
                                                    aria-valuemin={0}
                                                    aria-valuemax={100}
                                                    className="h-[3px] w-full bg-sand"
                                                >
                                                    <div
                                                        className="h-[3px] bg-line transition-[width] duration-300"
                                                        style={{
                                                            width: `${form.progress.percentage ?? 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <Button
                                                    type="submit"
                                                    disabled={form.processing}
                                                >
                                                    {form.processing
                                                        ? t(
                                                              'order.proof_sending',
                                                          )
                                                        : t(
                                                              'order.proof_submit',
                                                          )}
                                                </Button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                    </section>

                    {/* Status timeline */}
                    <section aria-labelledby="status-title">
                        <SignatureLine className="max-w-24" />
                        <h2
                            id="status-title"
                            className="display mt-6 text-display-m"
                        >
                            {t('order.status_title')}
                        </h2>

                        {order.closed ? (
                            <p className="mt-6 text-body-l">
                                {order.status === 'cancelled'
                                    ? t('order.cancelled')
                                    : t('order.returned')}
                            </p>
                        ) : (
                            <ol className="mt-6">
                                {timeline.map((step, index) => {
                                    const current = step.key === order.status;

                                    return (
                                        <li
                                            key={step.key}
                                            aria-current={
                                                current ? 'step' : undefined
                                            }
                                            className="relative flex gap-4 pb-6 last:pb-0"
                                        >
                                            {index < timeline.length - 1 && (
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        'absolute start-[5px] top-4 h-full w-[1.5px]',
                                                        timeline[index + 1]
                                                            .reached
                                                            ? 'bg-ink'
                                                            : 'bg-sand',
                                                    )}
                                                />
                                            )}
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'relative mt-2 size-3 shrink-0 rounded-full border-[1.5px]',
                                                    current
                                                        ? 'border-line bg-line'
                                                        : step.reached
                                                          ? 'border-ink bg-ink'
                                                          : 'border-sand bg-paper',
                                                )}
                                            />
                                            <span>
                                                <span
                                                    className={cn(
                                                        'block text-body-l',
                                                        !step.reached &&
                                                            'text-ink-muted',
                                                        current &&
                                                            'font-semibold',
                                                    )}
                                                >
                                                    {step.label}
                                                </span>
                                                {step.date && (
                                                    <span className="text-caption text-ink-muted">
                                                        {step.date}
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}

                        {order.tracking_number && (
                            <p className="mt-6 text-ink-muted">
                                {t('order.tracking')}:{' '}
                                <span dir="ltr">{order.tracking_number}</span>
                            </p>
                        )}
                    </section>

                    {whatsapp && (
                        <div>
                            <a
                                href={whatsapp}
                                target="_blank"
                                rel="noopener"
                                onClick={() =>
                                    track('support_contact_clicked', {
                                        channel: 'whatsapp',
                                        transaction_id: order.code,
                                    })
                                }
                                className={buttonClasses('secondary')}
                            >
                                {t('order.whatsapp')}
                            </a>
                        </div>
                    )}
                </div>

                {/* Summary card */}
                <aside
                    aria-labelledby="summary-title"
                    className="lg:col-span-4 lg:col-start-9"
                >
                    <div className="rounded-lg border border-sand bg-paper-raised p-4 md:p-6">
                        <h2 id="summary-title" className="text-title">
                            {t('order.summary_title')}
                        </h2>
                        {order.item && (
                            <>
                                {order.item.design_key && order.item.tint && (
                                    <div className="mt-4 rounded-lg bg-sand-deep px-[26%] py-[10%]">
                                        <Notebook
                                            designKey={order.item.design_key}
                                            tint={order.item.tint}
                                        />
                                    </div>
                                )}
                                <dl className="mt-4">
                                    <div className="flex justify-between gap-6 border-t border-sand py-3">
                                        <dt className="text-ink-muted">
                                            {order.item.product}
                                        </dt>
                                        <dd className="font-semibold">
                                            {order.item.design}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-6 border-t border-sand py-3">
                                        <dt className="text-ink-muted">
                                            {t('order.quantity')}
                                        </dt>
                                        <dd className="price">
                                            {localDigits(
                                                order.item.quantity,
                                                locale,
                                            )}
                                        </dd>
                                    </div>
                                    {order.item.gift_message && (
                                        <div className="border-t border-sand py-3">
                                            <dt className="text-ink-muted">
                                                {t('order.gift_message')}
                                            </dt>
                                            <dd className="mt-1 whitespace-pre-line">
                                                {order.item.gift_message}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="flex justify-between gap-6 border-t border-sand py-3">
                                        <dt className="text-ink-muted">
                                            {t('order.subtotal')}
                                        </dt>
                                        <dd className="price">
                                            {order.subtotal_label}
                                        </dd>
                                    </div>
                                    {order.discount > 0 && (
                                        <div className="flex justify-between gap-6 border-t border-sand py-3">
                                            <dt className="text-ink-muted">
                                                {t('order.discount')}
                                            </dt>
                                            <dd className="price">
                                                −{order.discount_label}
                                            </dd>
                                        </div>
                                    )}
                                    <div className="flex items-baseline justify-between gap-6 border-t-[1.5px] border-ink py-4">
                                        <dt className="text-label">
                                            {t('order.total')}
                                        </dt>
                                        <dd className="price text-title">
                                            {order.total_label}
                                        </dd>
                                    </div>
                                    <div className="flex justify-between gap-6 border-t border-sand pt-3">
                                        <dt className="text-ink-muted">
                                            {order.payment_method_label}
                                        </dt>
                                        <dd className="font-semibold">
                                            {order.payment_status_label}
                                        </dd>
                                    </div>
                                </dl>
                            </>
                        )}
                    </div>

                    <h2 className="mt-8 overline">
                        {t('order.delivery_title')}
                    </h2>
                    <p className="mt-2 text-ink-muted">
                        {order.address}
                        <br />
                        <span dir="ltr">{order.phone}</span>
                    </p>
                </aside>
            </div>
        </div>
    );
}
