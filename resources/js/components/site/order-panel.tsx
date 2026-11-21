import type { ReactNode } from 'react';
import { Cta } from '@/components/site/cta';
import { DesignPicker } from '@/components/site/design-picker';
import { TextAreaField, TextField } from '@/components/site/fields';
import { useT } from '@/hooks/use-t';
import type { Design, Product } from '@/types/site';

export function checkoutUrl(
    base: string,
    design?: string | null,
    name?: string,
    message?: string,
): string {
    const url = new URL(base);

    if (design) {
        url.searchParams.set('design', design);
    }

    if (name?.trim()) {
        url.searchParams.set('name', name.trim());
    }

    if (message?.trim()) {
        url.searchParams.set('message', message.trim());
    }

    return url.toString();
}

export function PriceBlock({ product }: { product: Product }) {
    const t = useT();

    return (
        <dl className="grid grid-cols-2 border-y border-stone">
            <div className="py-4 pe-4">
                <dt className="text-sm text-ink-soft">{t('product.price')}</dt>
                <dd className="mt-1 text-xl">{product.price_label}</dd>
            </div>
            <div className="border-s border-stone py-4 ps-4">
                <dt className="flex flex-wrap items-center gap-x-2 text-sm text-ink-soft">
                    {t('product.instapay_price')}
                    <span className="bg-line px-2 py-0.5 text-xs font-medium text-paper">
                        {t('product.save', { amount: product.saving_label })}
                    </span>
                </dt>
                <dd className="mt-1 text-xl text-line">
                    {product.instapay_label}
                </dd>
            </div>
        </dl>
    );
}

type Props = {
    product: Product;
    designs: Design[];
    design: Design | null;
    onDesign: (key: string) => void;
    name: string;
    onName: (value: string) => void;
    message: string;
    onMessage: (value: string) => void;
    /** Faculty pages lock the design and hide the picker. */
    lockDesign?: boolean;
    heading: ReactNode;
};

/** Price, design, personalisation and the order action in one panel. */
export function OrderPanel({
    product,
    designs,
    design,
    onDesign,
    name,
    onName,
    message,
    onMessage,
    lockDesign,
    heading,
}: Props) {
    const t = useT();
    const soldOut = lockDesign
        ? (design?.sold_out ?? true)
        : product.sold_out || (design?.sold_out ?? false);

    return (
        <div className="flex flex-col gap-8">
            {heading}
            <PriceBlock product={product} />

            {!lockDesign && (
                <DesignPicker
                    designs={designs}
                    value={design?.key ?? null}
                    onChange={onDesign}
                    legend={t('product.choose_design')}
                />
            )}

            <TextField
                label={t('product.cover_name')}
                optional={t('product.optional')}
                placeholder={t('product.cover_name_placeholder')}
                hint={t('product.cover_name_hint')}
                counter={`${name.length}/20`}
                maxLength={20}
                value={name}
                onChange={(event) => onName(event.target.value)}
                autoComplete="off"
            />

            <TextAreaField
                label={t('product.gift_message')}
                optional={t('product.optional')}
                placeholder={t('product.gift_message_placeholder')}
                counter={`${message.length}/200`}
                maxLength={200}
                value={message}
                onChange={(event) => onMessage(event.target.value)}
            />

            <div>
                {soldOut ? (
                    <Cta disabled full>
                        {product.sold_out
                            ? t('product.sold_out_all')
                            : t('product.sold_out')}
                    </Cta>
                ) : (
                    <Cta
                        full
                        href={checkoutUrl(
                            product.checkout_url,
                            design?.key,
                            name,
                            message,
                        )}
                    >
                        {lockDesign
                            ? t('cta.order_design')
                            : t('cta.order_pack')}
                    </Cta>
                )}
                <p className="mt-3 text-sm text-ink-soft">
                    {design && !design.sold_out && design.stock <= 5
                        ? t('product.in_stock_few', { count: design.stock })
                        : t('product.free_delivery')}
                </p>
            </div>
        </div>
    );
}
