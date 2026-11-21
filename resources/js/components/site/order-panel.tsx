import type { ReactNode } from 'react';
import { Badge } from '@/components/brand/Badge';
import { Cta } from '@/components/site/cta';
import { DesignPicker } from '@/components/site/design-picker';
import { TextAreaField } from '@/components/site/fields';
import { useSite, useT } from '@/hooks/use-t';
import { localDigits } from '@/lib/money';
import type { Design, Product } from '@/types/site';

export function checkoutUrl(
    base: string,
    design?: string | null,
    message?: string,
): string {
    const url = new URL(base);

    if (design) {
        url.searchParams.set('design', design);
    }

    if (message?.trim()) {
        url.searchParams.set('message', message.trim());
    }

    return url.toString();
}

/** "InstaPay −10%" / "إنستاباي −١٠٪" */
export function useInstapayBadge(product: Product): string {
    const t = useT();
    const { locale } = useSite();

    return t('product.instapay_badge', {
        percent: localDigits(product.discount_percent, locale),
    });
}

export function PriceBlock({ product }: { product: Product }) {
    const t = useT();
    const badge = useInstapayBadge(product);

    return (
        <dl className="grid grid-cols-2 rounded-lg border border-sand bg-paper-raised">
            <div className="p-4">
                <dt className="text-caption text-ink-muted">
                    {t('product.price')}
                </dt>
                <dd className="price mt-1 text-title">{product.price_label}</dd>
            </div>
            <div className="border-s border-sand p-4">
                <dt className="flex flex-wrap items-center gap-2 text-caption text-ink-muted">
                    {t('product.instapay_price')}
                    <Badge>{badge}</Badge>
                </dt>
                <dd className="price mt-1 text-title">
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
    message: string;
    onMessage: (value: string) => void;
    /** Faculty pages lock the design and hide the picker. */
    lockDesign?: boolean;
    heading: ReactNode;
};

/** Price, design, gift message and the order action in one panel. */
export function OrderPanel({
    product,
    designs,
    design,
    onDesign,
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
                            message,
                        )}
                    >
                        {lockDesign
                            ? t('cta.order_design')
                            : t('cta.order_pack')}
                    </Cta>
                )}
                <p className="mt-3 text-caption text-ink-muted">
                    {design && !design.sold_out && design.stock <= 5
                        ? t('product.in_stock_few', { count: design.stock })
                        : t('product.free_delivery')}
                </p>
            </div>
        </div>
    );
}
