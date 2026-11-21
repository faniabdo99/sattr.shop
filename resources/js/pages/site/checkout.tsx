import { Link, useForm } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import type { FormEvent } from 'react';
import { DesignPicker } from '@/components/site/design-picker';
import {
    SelectField,
    TextAreaField,
    TextField,
} from '@/components/site/fields';
import { CoverPreview } from '@/components/site/personalizer';
import { useSite, useT } from '@/hooks/use-t';
import { formatMoney } from '@/lib/money';
import { track } from '@/lib/track';
import { cn } from '@/lib/utils';
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
    preset: { design: string | null; name: string; message: string };
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

function Step({
    number,
    title,
    children,
}: {
    number: number;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section
            aria-labelledby={`step-${number}`}
            className="border-t border-stone py-10"
        >
            <h2 id={`step-${number}`} className="flex items-baseline gap-4">
                <span className="text-sm text-line tabular-nums">{number}</span>
                <span className="display text-display-md">{title}</span>
            </h2>
            <div className="mt-8 flex flex-col gap-8">{children}</div>
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
    const available = designs.filter((design) => !design.sold_out);
    const initial =
        available.find((design) => design.key === preset.design) ??
        available[0] ??
        null;

    const form = useForm({
        design: initial?.key ?? '',
        quantity: 1,
        cover_name: preset.name,
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

    const submit = (event: FormEvent) => {
        event.preventDefault();
        form.transform((values) => ({ ...values, quantity }));
        form.post(store_url, {
            preserveScroll: true,
            onError: () => {
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
            <div className="wrap py-24">
                <h1 className="display text-display-lg">
                    {t('checkout.sold_out_notice')}
                </h1>
                <p className="mt-6">
                    <Link href={site.home} className="link-line">
                        {t('not_found.home')}
                    </Link>
                </p>
            </div>
        );
    }

    return (
        <form
            onSubmit={submit}
            noValidate
            className="wrap pt-8 pb-36 md:pt-14 lg:pb-24"
        >
            <h1 className="display text-display-lg">{t('checkout.title')}</h1>

            {errorCount > 0 && (
                <div
                    id="checkout-errors"
                    role="alert"
                    className="mt-8 border-s-2 border-danger ps-4 text-danger"
                >
                    <p className="font-medium">{t('checkout.errors_title')}</p>
                    {general && <p className="mt-1">{general}</p>}
                </div>
            )}

            <div className="mt-8 grid gap-x-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                    <Step number={1} title={t('checkout.section_pack')}>
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
                                className="text-sm font-medium"
                            >
                                {t('checkout.quantity')}
                            </span>
                            <div
                                className="mt-3 flex items-center gap-1"
                                role="group"
                                aria-labelledby="quantity-label"
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData(
                                            'quantity',
                                            Math.max(1, quantity - 1),
                                        )
                                    }
                                    disabled={quantity <= 1}
                                    aria-label="−"
                                    className="size-12 border border-ink/25 text-xl disabled:opacity-35"
                                >
                                    −
                                </button>
                                <output
                                    aria-live="polite"
                                    className="flex size-12 items-center justify-center text-lg tabular-nums"
                                >
                                    {quantity}
                                </output>
                                <button
                                    type="button"
                                    onClick={() =>
                                        setData(
                                            'quantity',
                                            Math.min(
                                                maxForDesign,
                                                quantity + 1,
                                            ),
                                        )
                                    }
                                    disabled={quantity >= maxForDesign}
                                    aria-label="+"
                                    className="size-12 border border-ink/25 text-xl disabled:opacity-35"
                                >
                                    +
                                </button>
                            </div>
                            {errors.quantity ? (
                                <p className="mt-2 text-sm text-danger">
                                    {errors.quantity}
                                </p>
                            ) : (
                                design &&
                                design.stock <= max_quantity && (
                                    <p className="mt-2 text-sm text-ink-soft">
                                        {t('checkout.only_left', {
                                            count: design.stock,
                                        })}
                                    </p>
                                )
                            )}
                        </div>
                    </Step>

                    <Step number={2} title={t('checkout.section_personal')}>
                        <TextField
                            label={t('product.cover_name')}
                            optional={t('product.optional')}
                            placeholder={t('product.cover_name_placeholder')}
                            hint={t('product.cover_name_hint')}
                            counter={`${data.cover_name.length}/20`}
                            maxLength={20}
                            value={data.cover_name}
                            onChange={(event) =>
                                setData('cover_name', event.target.value)
                            }
                            error={errors.cover_name}
                            autoComplete="off"
                        />
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

                    <Step number={3} title={t('checkout.section_delivery')}>
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
                        <div className="grid gap-8 sm:grid-cols-2">
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
                        <div className="grid gap-8 sm:grid-cols-2">
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

                    <Step number={4} title={t('checkout.section_payment')}>
                        <fieldset>
                            <legend className="sr-only">
                                {t('checkout.section_payment')}
                            </legend>
                            <div className="flex flex-col gap-3">
                                {payment_options.map((item) => {
                                    const selected =
                                        item.key === data.payment_method;

                                    return (
                                        <label
                                            key={item.key}
                                            className={cn(
                                                'flex cursor-pointer items-start gap-4 border p-5 transition-colors duration-300',
                                                selected
                                                    ? 'border-line'
                                                    : 'border-ink/20 hover:border-ink/50',
                                            )}
                                        >
                                            <input
                                                type="radio"
                                                name="payment_method"
                                                value={item.key}
                                                checked={selected}
                                                onChange={() =>
                                                    choosePayment(item.key)
                                                }
                                                className="peer sr-only"
                                            />
                                            <span
                                                aria-hidden="true"
                                                className={cn(
                                                    'mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border peer-focus-visible:ring-2 peer-focus-visible:ring-line peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-paper',
                                                    selected
                                                        ? 'border-line'
                                                        : 'border-ink/40',
                                                )}
                                            >
                                                {selected && (
                                                    <span className="size-2.5 rounded-full bg-line" />
                                                )}
                                            </span>
                                            <span className="flex-1">
                                                <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                    <span className="text-lg font-medium">
                                                        {t(
                                                            `checkout.${item.key}`,
                                                        )}
                                                    </span>
                                                    {item.saving > 0 && (
                                                        <>
                                                            <span className="bg-line px-2 py-0.5 text-xs font-medium text-paper">
                                                                {t(
                                                                    'product.save',
                                                                    {
                                                                        amount: item.saving_label,
                                                                    },
                                                                )}
                                                            </span>
                                                            <span className="text-sm text-ink-soft">
                                                                {t(
                                                                    'checkout.recommended',
                                                                )}
                                                            </span>
                                                        </>
                                                    )}
                                                </span>
                                                <span className="mt-1 block text-ink-soft">
                                                    {t(
                                                        `checkout.${item.key}_body`,
                                                    )}
                                                </span>
                                            </span>
                                            <span className="text-lg tabular-nums">
                                                {formatMoney(
                                                    item.unit_price * quantity,
                                                    locale,
                                                )}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                            {errors.payment_method && (
                                <p className="mt-3 text-sm text-danger">
                                    {errors.payment_method}
                                </p>
                            )}
                        </fieldset>
                        {site.turnstileSiteKey && <div ref={turnstileRef} />}
                    </Step>
                </div>

                <aside
                    aria-labelledby="summary-title"
                    className="lg:col-span-4 lg:col-start-9"
                >
                    <div className="border-t border-stone pt-10 lg:sticky lg:top-8 lg:border-t-0 lg:pt-10">
                        <h2
                            id="summary-title"
                            className="display text-display-md"
                        >
                            {t('checkout.summary')}
                        </h2>
                        {design && (
                            <CoverPreview
                                design={design}
                                name={data.cover_name}
                                className="mt-6 max-w-64 lg:max-w-none"
                            />
                        )}
                        <dl className="mt-6 text-[0.9375rem]">
                            <div className="flex justify-between border-t border-stone py-3">
                                <dt className="text-ink-soft">
                                    {product.name} × {quantity}
                                </dt>
                                <dd className="tabular-nums">
                                    {formatMoney(subtotal, locale)}
                                </dd>
                            </div>
                            {discount > 0 && (
                                <div className="flex justify-between border-t border-stone py-3 text-line">
                                    <dt>{t('checkout.discount')}</dt>
                                    <dd className="tabular-nums">
                                        −{formatMoney(discount, locale)}
                                    </dd>
                                </div>
                            )}
                            <div className="flex justify-between border-t border-stone py-3">
                                <dt className="text-ink-soft">
                                    {t('checkout.delivery')}
                                </dt>
                                <dd>{t('checkout.free')}</dd>
                            </div>
                            <div className="flex items-baseline justify-between border-y border-ink py-4">
                                <dt className="font-medium">
                                    {t('checkout.total')}
                                </dt>
                                <dd
                                    className="text-2xl tabular-nums"
                                    aria-live="polite"
                                >
                                    {formatMoney(total, locale)}
                                </dd>
                            </div>
                        </dl>
                        <button
                            type="submit"
                            disabled={processing}
                            className="mt-6 hidden min-h-14 w-full items-center justify-center bg-line px-8 font-medium text-paper transition-colors duration-300 hover:bg-line-deep disabled:bg-stone disabled:text-ink-soft lg:flex"
                        >
                            {processing
                                ? t('checkout.placing')
                                : t('checkout.place_order')}
                        </button>
                        {terms && (
                            <p className="mt-4 text-sm text-ink-soft">
                                {t('checkout.terms')}{' '}
                                <Link
                                    href={terms.url}
                                    className="underline underline-offset-4"
                                >
                                    {terms.title}
                                </Link>
                                .
                            </p>
                        )}
                    </div>
                </aside>
            </div>

            {/* One-hand submit on phones */}
            <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone bg-paper pb-[env(safe-area-inset-bottom)] lg:hidden">
                <div className="flex items-center justify-between gap-4 px-5 py-3">
                    <p className="leading-tight">
                        <span className="block text-sm text-ink-soft">
                            {t('checkout.total')}
                        </span>
                        <span className="text-lg font-medium tabular-nums">
                            {formatMoney(total, locale)}
                        </span>
                    </p>
                    <button
                        type="submit"
                        disabled={processing}
                        className="flex min-h-12 items-center bg-line px-8 font-medium text-paper disabled:bg-stone disabled:text-ink-soft"
                    >
                        {processing
                            ? t('checkout.placing')
                            : t('checkout.place_order')}
                    </button>
                </div>
            </div>
        </form>
    );
}
