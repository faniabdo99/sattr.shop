import { useForm } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { TextField } from '@/components/site/fields';
import { Notebook } from '@/components/site/notebook';
import { RuledLine } from '@/components/site/ruled-line';
import { useT } from '@/hooks/use-t';
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
            cover_name: string | null;
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
    label,
    value,
    copyValue,
}: {
    label: string;
    value: string;
    copyValue?: string;
}) {
    const t = useT();
    const [copied, setCopied] = useState(false);

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(copyValue ?? value);
            setCopied(true);
            window.setTimeout(() => setCopied(false), 2000);
        } catch {
            setCopied(false);
        }
    };

    return (
        <div className="flex items-center justify-between gap-4 border-t border-paper/20 py-4">
            <div>
                <dt className="text-sm text-paper/60">{label}</dt>
                <dd className="mt-0.5 text-xl break-all" dir="ltr">
                    {value}
                </dd>
            </div>
            <button
                type="button"
                onClick={copy}
                className="min-h-11 shrink-0 border border-paper/40 px-4 text-sm font-medium transition-colors duration-300 hover:border-paper"
            >
                <span aria-live="polite">
                    {copied ? t('order.copied') : t('order.copy')}
                </span>
            </button>
        </div>
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
    const form = useForm<{ proof: File | null; reference: string }>({
        proof: null,
        reference: '',
    });

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

    const hasDetails = Boolean(
        instapay?.ipa || instapay?.phone || instapay?.qr,
    );

    return (
        <div className="wrap pt-10 pb-24 md:pt-16">
            <header>
                <h1 className="display text-display-lg">
                    {t('order.thanks', { name: order.customer_name })}
                </h1>
                <p className="mt-4 text-lede text-ink-soft">
                    {t('order.received', { code: order.code })}
                </p>
                <p className="mt-2 text-sm text-ink-soft">
                    {t('order.save_link')}
                </p>
            </header>

            <div className="mt-10 grid gap-x-8 gap-y-12 lg:grid-cols-12">
                <div className="flex flex-col gap-12 lg:col-span-7">
                    {/* Payment */}
                    <section aria-labelledby="payment-title">
                        <h2 id="payment-title" className="sr-only">
                            {t('order.payment_title')}
                        </h2>

                        {order.payment_status === 'paid' && (
                            <p className="border-s-2 border-ok ps-4 text-lg">
                                {t('order.paid')}
                            </p>
                        )}

                        {order.payment_status === 'refunded' && (
                            <p className="border-s-2 border-ink ps-4 text-lg">
                                {t('order.refunded')}
                            </p>
                        )}

                        {order.payment_method === 'cod' &&
                            order.payment_status === 'unpaid' &&
                            !order.closed && (
                                <p className="border-s-2 border-line ps-4 text-lg">
                                    {t('order.cod_note', {
                                        amount: order.total_label,
                                    })}
                                </p>
                            )}

                        {instapay &&
                            order.payment_status ===
                                'awaiting_verification' && (
                                <p
                                    role="status"
                                    className="border-s-2 border-line ps-4 text-lg"
                                >
                                    {t('order.proof_received')}
                                </p>
                            )}

                        {instapay &&
                            order.payment_status === 'unpaid' &&
                            !order.closed && (
                                <>
                                    <div className="bg-ink p-6 text-paper sm:p-10">
                                        <h3 className="display text-display-md">
                                            {t('order.pay_title', {
                                                amount: order.total_label,
                                            })}
                                        </h3>
                                        <p className="mt-3 max-w-lg text-paper/70">
                                            {t('order.pay_body')}
                                        </p>

                                        {hasDetails ? (
                                            <div className="mt-8 grid gap-8 sm:grid-cols-[1fr_auto]">
                                                <dl>
                                                    <CopyRow
                                                        label={t(
                                                            'order.amount',
                                                        )}
                                                        value={
                                                            order.total_label
                                                        }
                                                        copyValue={
                                                            order.amount_plain
                                                        }
                                                    />
                                                    {instapay.ipa && (
                                                        <CopyRow
                                                            label={t(
                                                                'order.ipa',
                                                            )}
                                                            value={instapay.ipa}
                                                        />
                                                    )}
                                                    {instapay.phone && (
                                                        <CopyRow
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
                                                        className="size-44 bg-paper p-2"
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <p className="mt-8 border-t border-paper/20 pt-4">
                                                {t('order.instapay_missing')}
                                            </p>
                                        )}
                                    </div>

                                    {instapay.can_submit && (
                                        <form
                                            onSubmit={submit}
                                            className="mt-8 flex flex-col gap-8"
                                            noValidate
                                        >
                                            <h3 className="display text-display-sm">
                                                {t('order.proof_title')}
                                            </h3>

                                            {instapay.rejection && (
                                                <p
                                                    role="alert"
                                                    className="border-s-2 border-danger ps-4 text-danger"
                                                >
                                                    {t('order.proof_rejected', {
                                                        reason: instapay.rejection,
                                                    })}
                                                </p>
                                            )}

                                            <div>
                                                <label
                                                    htmlFor="proof"
                                                    className="text-sm font-medium"
                                                >
                                                    {t('order.proof_file')}
                                                </label>
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
                                                    className="mt-3 block w-full text-[0.9375rem] file:me-4 file:min-h-11 file:cursor-pointer file:border file:border-solid file:border-ink/30 file:bg-transparent file:px-5 file:text-sm file:font-medium file:text-ink"
                                                />
                                                <p
                                                    id="proof-help"
                                                    className={cn(
                                                        'mt-2 text-sm',
                                                        form.errors.proof
                                                            ? 'text-danger'
                                                            : 'text-ink-soft',
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
                                                    className="h-px w-full bg-stone"
                                                >
                                                    <div
                                                        className="h-px bg-line transition-[width] duration-300"
                                                        style={{
                                                            width: `${form.progress.percentage ?? 0}%`,
                                                        }}
                                                    />
                                                </div>
                                            )}

                                            <div>
                                                <button
                                                    type="submit"
                                                    disabled={form.processing}
                                                    className="min-h-13 bg-line px-8 font-medium text-paper transition-colors duration-300 hover:bg-line-deep disabled:bg-stone disabled:text-ink-soft"
                                                >
                                                    {form.processing
                                                        ? t(
                                                              'order.proof_sending',
                                                          )
                                                        : t(
                                                              'order.proof_submit',
                                                          )}
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                    </section>

                    {/* Status timeline */}
                    <section aria-labelledby="status-title">
                        <RuledLine />
                        <h2
                            id="status-title"
                            className="display mt-6 text-display-md"
                        >
                            {t('order.status_title')}
                        </h2>

                        {order.closed ? (
                            <p className="mt-6 text-lg">
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
                                            className="relative flex gap-5 pb-7 last:pb-0"
                                        >
                                            {index < timeline.length - 1 && (
                                                <span
                                                    aria-hidden="true"
                                                    className={cn(
                                                        'absolute start-[5px] top-4 h-full w-px',
                                                        timeline[index + 1]
                                                            .reached
                                                            ? 'bg-line'
                                                            : 'bg-stone',
                                                    )}
                                                />
                                            )}
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'relative mt-2 size-[11px] shrink-0 rounded-full border',
                                                    step.reached
                                                        ? 'border-line bg-line'
                                                        : 'border-ink/30 bg-paper',
                                                )}
                                            />
                                            <span>
                                                <span
                                                    className={cn(
                                                        'block text-lg',
                                                        !step.reached &&
                                                            'text-ink-soft',
                                                        current &&
                                                            'font-medium',
                                                    )}
                                                >
                                                    {step.label}
                                                </span>
                                                {step.date && (
                                                    <span className="text-sm text-ink-soft">
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
                            <p className="mt-6 text-ink-soft">
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
                                className="inline-flex min-h-13 items-center border border-ink/25 px-8 font-medium transition-colors duration-300 hover:border-ink"
                            >
                                {t('order.whatsapp')}
                            </a>
                        </div>
                    )}
                </div>

                {/* Summary */}
                <aside
                    aria-labelledby="summary-title"
                    className="lg:col-span-4 lg:col-start-9"
                >
                    <h2 id="summary-title" className="display text-display-md">
                        {t('order.summary_title')}
                    </h2>
                    {order.item && (
                        <>
                            {order.item.design_key && order.item.tint && (
                                <div className="mt-6 bg-paper-deep px-[22%] py-[10%]">
                                    <Notebook
                                        designKey={order.item.design_key}
                                        tint={order.item.tint}
                                        name={order.item.cover_name ?? ''}
                                    />
                                </div>
                            )}
                            <dl className="mt-6 text-[0.9375rem]">
                                <div className="flex justify-between gap-6 border-t border-stone py-3">
                                    <dt className="text-ink-soft">
                                        {order.item.product}
                                    </dt>
                                    <dd>{order.item.design}</dd>
                                </div>
                                <div className="flex justify-between gap-6 border-t border-stone py-3">
                                    <dt className="text-ink-soft">
                                        {t('order.quantity')}
                                    </dt>
                                    <dd className="tabular-nums">
                                        {order.item.quantity}
                                    </dd>
                                </div>
                                {order.item.cover_name && (
                                    <div className="flex justify-between gap-6 border-t border-stone py-3">
                                        <dt className="text-ink-soft">
                                            {t('order.cover_name')}
                                        </dt>
                                        <dd>{order.item.cover_name}</dd>
                                    </div>
                                )}
                                {order.item.gift_message && (
                                    <div className="border-t border-stone py-3">
                                        <dt className="text-ink-soft">
                                            {t('order.gift_message')}
                                        </dt>
                                        <dd className="mt-1 whitespace-pre-line">
                                            {order.item.gift_message}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex justify-between gap-6 border-t border-stone py-3">
                                    <dt className="text-ink-soft">
                                        {t('order.subtotal')}
                                    </dt>
                                    <dd className="tabular-nums">
                                        {order.subtotal_label}
                                    </dd>
                                </div>
                                {order.discount > 0 && (
                                    <div className="flex justify-between gap-6 border-t border-stone py-3 text-line">
                                        <dt>{t('order.discount')}</dt>
                                        <dd className="tabular-nums">
                                            −{order.discount_label}
                                        </dd>
                                    </div>
                                )}
                                <div className="flex items-baseline justify-between gap-6 border-y border-ink py-4">
                                    <dt className="font-medium">
                                        {t('order.total')}
                                    </dt>
                                    <dd className="text-2xl tabular-nums">
                                        {order.total_label}
                                    </dd>
                                </div>
                                <div className="flex justify-between gap-6 py-3">
                                    <dt className="text-ink-soft">
                                        {order.payment_method_label}
                                    </dt>
                                    <dd>{order.payment_status_label}</dd>
                                </div>
                            </dl>
                        </>
                    )}

                    <h2 className="mt-8 text-sm font-medium">
                        {t('order.delivery_title')}
                    </h2>
                    <p className="mt-2 text-ink-soft">
                        {order.address}
                        <br />
                        <span dir="ltr">{order.phone}</span>
                    </p>
                </aside>
            </div>
        </div>
    );
}
