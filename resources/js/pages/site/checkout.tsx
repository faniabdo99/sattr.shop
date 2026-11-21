import { Link, useForm } from '@inertiajs/react';
import { Minus, Plus } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { Badge } from '@/components/brand/Badge';
import { Button } from '@/components/brand/Button';
import { SignatureLine } from '@/components/brand/SignatureLine';
import { DesignPicker } from '@/components/site/design-picker';
import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/site/fields';
import { useInstapayBadge } from '@/components/site/order-panel';
import { RadioCard } from '@/components/site/radio-card';
import { useSite, useT } from '@/hooks/use-t';
import { formatMoney, localDigits } from '@/lib/money';
import { posthogHeaders, track } from '@/lib/track';
import type { Design, Product } from '@/types/site';

type PaymentOption = {
    key: 'instapay' | 'cod';
    unit_price: number;
    saving: number;
    saving_label: string;
};

type Props = {
    product: Product;
    designs: Design[];
    payment_options: PaymentOption[];
    governorates: { key: string; name: string }[];
    max_quantity: number;
    preset: { design: string | null; message: string };
    store_url: string;
};

type Turnstile = {
    render: (element: HTMLElement, options: Record<string, unknown>) => string;
    reset: (id?: string) => void;
};

declare global {
    interface Window {
        turnstile?: Turnstile;
    }
}

/** A checkout section, opened by the signature line. */
function Step({
    id,
    title,
    onBlur,
    children,
}: {
    id: string;
    title: string;
    /** Runs when focus leaves any field in the section. */
    onBlur?: () => void;
    children: ReactNode;
}) {
    return (
        <section aria-labelledby={id} className="pt-12" onBlur={onBlur}>
            <SignatureLine className="max-w-24" />
            <h2 id={id} className="display mt-6 text-display-m">
                {title}
            </h2>
            <div className="mt-6 flex flex-col gap-6">{children}</div>
        </section>
    );
}

export default function Checkout({
    product,
    designs,
    payment_options,
    governorates,
    max_quantity,
    preset,
    store_url,
}: Props) {
    const t = useT();
    const { site, locale } = useSite();
    const badge = useInstapayBadge(product);
    const available = designs.filter((design) => !design.sold_out);
    const initial =
        available.find((design) => design.key === preset.design) ??
        available[0] ??
        null;

    const form = useForm({
        design: initial?.key ?? '',
        quantity: 1,
        gift_message: preset.message,
        customer_name: '',
        phone: '',
        alt_phone: '',
        email: '',
        governorate: '',
        city: '',
        address: '',
        notes: '',
        payment_method: payment_options[0]?.key ?? 'instapay',
        website: '',
        turnstile_token: '',
    });

    const { data, setData, errors, processing } = form;
    const design = designs.find((item) => item.key === data.design) ?? initial;
    const option =
        payment_options.find((item) => item.key === data.payment_method) ??
        payment_options[0];
    const maxForDesign = Math.max(
        1,
        Math.min(max_quantity, design?.stock ?? max_quantity),
    );
    const quantity = Math.min(data.quantity, maxForDesign);

    // Display only. The server recalculates every amount when the order is placed.
    const subtotal = product.price * quantity;
    const total = option.unit_price * quantity;
    const discount = subtotal - total;

    const items = [
        {
            item_id: `gift-pack-${data.design}`,
            item_name: product.name,
            item_variant: design?.name,
            price: option.unit_price / 100,
            quantity,
        },
    ];

    useEffect(() => {
        track('begin_checkout', { value: total / 100, items });
        // Once, when checkout opens.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const turnstileRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const key = site.turnstileSiteKey;
        const element = turnstileRef.current;

        if (!key || !element) {
            return;
        }

        const mount = () =>
            window.turnstile?.render(element, {
                sitekey: key,
                language: locale,
                callback: (token: string) => setData('turnstile_token', token),
                'expired-callback': () => setData('turnstile_token', ''),
            });

        if (window.turnstile) {
            mount();

            return;
        }

        const script = document.createElement('script');

        script.src =
            'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.onload = mount;
        document.head.appendChild(script);
        // Mounted once per checkout visit.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [site.turnstileSiteKey]);

    const choosePayment = (key: PaymentOption['key']) => {
        setData('payment_method', key);
        track('add_payment_info', {
            payment_type: key,
            value:
                ((payment_options.find((item) => item.key === key)
                    ?.unit_price ?? 0) *
                    quantity) /
                100,
            items,
        });
    };

    const changeQuantity = (next: number) => {
        setData('quantity', next);
        track('checkout_quantity_changed', {
            quantity: next,
            design: data.design,
        });
    };

    // Fires once, when the last required delivery field has been filled in.
    const deliveryTracked = useRef(false);
    const trackDelivery = () => {
        const complete = [
            data.customer_name,
            data.phone,
            data.governorate,
            data.city,
            data.address,
        ].every((value) => value.trim() !== '');

        if (complete && !deliveryTracked.current) {
            deliveryTracked.current = true;
            track('add_shipping_info', {
                value: total / 100,
                governorate: data.governorate,
                items,
            });
        }
    };

    const submit = (event: FormEvent) => {
        event.preventDefault();
        track('checkout_submitted', {
            value: total / 100,
            payment_type: data.payment_method,
            design: data.design,
            quantity,
            has_gift_message: data.gift_message.trim() !== '',
            items,
        });
        form.transform((values) => ({ ...values, quantity }));
        form.post(store_url, {
            preserveScroll: true,
            headers: posthogHeaders(),
            onError: (failed) => {
                track('checkout_failed', {
                    payment_type: data.payment_method,
                    error_fields: Object.keys(failed),
                });
                window.turnstile?.reset();
                document
                    .getElementById('checkout-errors')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            },
        });
    };

    const terms = site.pages.find((page) => page.key === 'terms');
    const general =
        (errors as Record<string, string>).throttle ??
        errors.turnstile_token ??
        errors.website;
    const errorCount = Object.keys(errors).length;

    if (!initial) {
        return (
            <div className="wrap section">
                <h1 className="display text-display-l">
                    {t('checkout.sold_out_notice')}
                </h1>
                <p className="mt-6">
                    <Link
                        href={site.home}
                        className="link-line !bg-[length:100%_1.5px] text-label"
                    >
                        {t('not_found.home')}
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={submit} noValidate className="wrap pt-12 pb-24">
            <div className="mx-auto max-w-[640px]">
                <h1 className="display text-display-l">
                    {t('checkout.title')}
                </h1>

                {errorCount > 0 && (
                    <div
                        id="checkout-errors"
                        role="alert"
                        className="mt-6 rounded-sm border border-danger bg-paper-raised p-4 text-danger"
                    >
                        <p className="text-label">
                            {t('checkout.errors_title')}
                        </p>
                        {general && (
                            <p className="mt-1 text-caption">{general}</p>
                        )}
                    </div>
                )}

                <Step id="step-pack" title={t('checkout.section_pack')}>
                    <DesignPicker
                        designs={designs}
                        value={data.design}
                        onChange={(key) => {
                            setData('design', key);
                            track('select_design', { design: key });
                        }}
                        legend={t('product.choose_design')}
                        error={errors.design}
                    />
                    <div>
                        <span
                            id="quantity-label"
                            className="text-label text-ink-muted"
                        >
                            {t('checkout.quantity')}
                        </span>
                        <div
                            className="mt-2 flex items-center gap-2"
                            role="group"
                            aria-labelledby="quantity-label"
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    changeQuantity(Math.max(1, quantity - 1))
                                }
                                disabled={quantity <= 1}
                                aria-label="−"
                                className="flex size-12 items-center justify-center rounded-sm border border-sand bg-paper-raised hover:border-ink disabled:opacity-40"
                            >
                                <Minus
                                    size={20}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </button>
                            <output
                                aria-live="polite"
                                className="price flex size-12 items-center justify-center text-body-l"
                            >
                                {localDigits(quantity, locale)}
                            </output>
                            <button
                                type="button"
                                onClick={() =>
                                    changeQuantity(
                                        Math.min(maxForDesign, quantity + 1),
                                    )
                                }
                                disabled={quantity >= maxForDesign}
                                aria-label="+"
                                className="flex size-12 items-center justify-center rounded-sm border border-sand bg-paper-raised hover:border-ink disabled:opacity-40"
                            >
                                <Plus
                                    size={20}
                                    strokeWidth={1.5}
                                    aria-hidden="true"
                                />
                            </button>
                        </div>
                        {errors.quantity ? (
                            <p className="mt-2 text-caption text-danger">
                                {errors.quantity}
                            </p>
                        ) : (
                            design &&
                            design.stock <= max_quantity && (
                                <p className="mt-2 text-caption text-ink-muted">
                                    {t('checkout.only_left', {
                                        count: localDigits(
                                            design.stock,
                                            locale,
                                        ),
                                    })}
                                </p>
                            )
                        )}
                    </div>
                    <TextAreaField
                        label={t('product.gift_message')}
                        optional={t('product.optional')}
                        placeholder={t('product.gift_message_placeholder')}
                        counter={`${data.gift_message.length}/200`}
                        maxLength={200}
                        value={data.gift_message}
                        onChange={(event) =>
                            setData('gift_message', event.target.value)
                        }
                        error={errors.gift_message}
                    />
                </Step>

                <Step
                    id="step-delivery"
                    title={t('checkout.section_delivery')}
                    onBlur={trackDelivery}
                >
                    <TextField
                        label={t('checkout.full_name')}
                        name="name"
                        autoComplete="name"
                        required
                        value={data.customer_name}
                        onChange={(event) =>
                            setData('customer_name', event.target.value)
                        }
                        error={errors.customer_name}
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
                        <TextField
                            label={t('checkout.phone')}
                            hint={t('checkout.phone_hint')}
                            name="tel"
                            type="tel"
                            inputMode="numeric"
                            autoComplete="tel-national"
                            dir="ltr"
                            placeholder="01XXXXXXXXX"
                            maxLength={16}
                            required
                            value={data.phone}
                            onChange={(event) =>
                                setData('phone', event.target.value)
                            }
                            error={errors.phone}
                        />
                        <TextField
                            label={t('checkout.alt_phone')}
                            optional={t('product.optional')}
                            type="tel"
                            inputMode="numeric"
                            dir="ltr"
                            maxLength={16}
                            value={data.alt_phone}
                            onChange={(event) =>
                                setData('alt_phone', event.target.value)
                            }
                            error={errors.alt_phone}
                        />
                    </div>
                    <TextField
                        label={t('checkout.email')}
                        optional={t('product.optional')}
                        hint={t('checkout.email_hint')}
                        name="email"
                        type="email"
                        inputMode="email"
                        autoComplete="email"
                        dir="ltr"
                        value={data.email}
                        onChange={(event) =>
                            setData('email', event.target.value)
                        }
                        error={errors.email}
                    />
                    <div className="grid gap-6 sm:grid-cols-2">
                        <SelectField
                            label={t('checkout.governorate')}
                            name="governorate"
                            autoComplete="address-level1"
                            required
                            value={data.governorate}
                            onChange={(event) =>
                                setData('governorate', event.target.value)
                            }
                            error={errors.governorate}
                        >
                            <option value="" disabled>
                                {t('checkout.governorate_placeholder')}
                            </option>
                            {governorates.map((governorate) => (
                                <option
                                    key={governorate.key}
                                    value={governorate.key}
                                >
                                    {governorate.name}
                                </option>
                            ))}
                        </SelectField>
                        <TextField
                            label={t('checkout.city')}
                            name="city"
                            autoComplete="address-level2"
                            required
                            value={data.city}
                            onChange={(event) =>
                                setData('city', event.target.value)
                            }
                            error={errors.city}
                        />
                    </div>
                    <TextField
                        label={t('checkout.address')}
                        name="address"
                        autoComplete="street-address"
                        placeholder={t('checkout.address_placeholder')}
                        required
                        value={data.address}
                        onChange={(event) =>
                            setData('address', event.target.value)
                        }
                        error={errors.address}
                    />
                    <TextAreaField
                        label={t('checkout.notes')}
                        optional={t('product.optional')}
                        rows={2}
                        maxLength={500}
                        value={data.notes}
                        onChange={(event) =>
                            setData('notes', event.target.value)
                        }
                        error={errors.notes}
                    />
                    {/* Honeypot: hidden from people, tempting to bots. */}
                    <div
                        aria-hidden="true"
                        className="absolute -start-[9999px] h-0 w-0 overflow-hidden"
                    >
                        <label>
                            {t('checkout.honeypot')}
                            <input
                                type="text"
                                name="website"
                                tabIndex={-1}
                                autoComplete="off"
                                value={data.website}
                                onChange={(event) =>
                                    setData('website', event.target.value)
                                }
                            />
                        </label>
                    </div>
                </Step>

                <Step id="step-payment" title={t('checkout.section_payment')}>
                    <fieldset>
                        <legend className="sr-only">
                            {t('checkout.section_payment')}
                        </legend>
                        <div className="flex flex-col gap-3">
                            {payment_options.map((item) => (
                                <RadioCard
                                    key={item.key}
                                    name="payment_method"
                                    value={item.key}
                                    checked={item.key === data.payment_method}
                                    onChange={() => choosePayment(item.key)}
                                >
                                    <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <span className="text-body-l font-semibold">
                                            {t(`checkout.${item.key}`)}
                                        </span>
                                        {item.saving > 0 && (
                                            <Badge>{badge}</Badge>
                                        )}
                                    </span>
                                    <span className="mt-1 block text-ink-muted">
                                        {t(`checkout.${item.key}_body`)}
                                    </span>
                                    <span className="price mt-3 block text-body-l">
                                        {formatMoney(
                                            item.unit_price * quantity,
                                            locale,
                                        )}
                                    </span>
                                </RadioCard>
                            ))}
                        </div>
                        {errors.payment_method && (
                            <p className="mt-3 text-caption text-danger">
                                {errors.payment_method}
                            </p>
                        )}
                    </fieldset>
                    {site.turnstileSiteKey && <div ref={turnstileRef} />}
                </Step>

                <section aria-labelledby="summary-title" className="pt-12">
                    <SignatureLine className="max-w-24" />
                    <div className="mt-6 rounded-lg border border-sand bg-paper-raised p-4 md:p-6">
                        <h2 id="summary-title" className="text-title">
                            {t('checkout.summary')}
                        </h2>
                        <dl className="mt-4">
                            <div className="flex justify-between gap-6 border-t border-sand py-3">
                                <dt className="text-ink-muted">
                                    {product.name}
                                    {design ? `, ${design.name}` : ''} ×{' '}
                                    {localDigits(quantity, locale)}
                                </dt>
                                <dd className="price">
                                    {formatMoney(subtotal, locale)}
                                </dd>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between gap-6 border-t border-sand py-3">
                                    <dt className="text-ink-muted">
                                        {t('checkout.discount')}
                                    </dt>
                                    <dd className="price">
                                        −{formatMoney(discount, locale)}
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between gap-6 border-t border-sand py-3">
                                <dt className="text-ink-muted">
                                    {t('checkout.delivery')}
                                </dt>
                                <dd className="font-semibold">
                                    {t('checkout.free')}
                                </dd>
                            </div>
                            <div className="flex items-baseline justify-between gap-6 border-t-[1.5px] border-ink pt-4">
                                <dt className="text-label">
                                    {t('checkout.total')}
                                </dt>
                                <dd
                                    className="price text-title"
                                    aria-live="polite"
                                >
                                    {formatMoney(total, locale)}
                                </dd>
                            </div>
                        </dl>
                    </div>

                    <Button
                        type="submit"
                        full
                        disabled={processing}
                        className="mt-6"
                    >
                        {processing
                            ? t('checkout.placing')
                            : t('checkout.place_order')}
                    </Button>
                    {terms && (
                        <p className="mt-4 text-caption text-ink-muted">
                            {t('checkout.terms')}{' '}
                            <Link
                                href={terms.url}
                                className="text-ink underline decoration-line decoration-[1.5px] underline-offset-4"
                            >
                                {terms.title}
                            </Link>
                            .
                        </p>
                    )}
                </section>
            </div>
        </form>
    );
}
