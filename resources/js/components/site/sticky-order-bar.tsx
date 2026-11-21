import { Link } from '@inertiajs/react';
import { buttonClasses } from '@/components/brand/Button';
import { useT } from '@/hooks/use-t';
import { track } from '@/lib/track';
import type { Product } from '@/types/site';

/** Phone order bar: ink ground, price at the start, blue CTA at the end. */
export function StickyOrderBar({
    product,
    href,
    soldOut = product.sold_out,
}: {
    product: Product;
    href: string;
    soldOut?: boolean;
}) {
    const t = useT();

    return (
        <div
            data-theme="ink"
            className="fixed inset-x-0 bottom-0 z-30 pb-[env(safe-area-inset-bottom)] md:hidden"
        >
            <div className="flex items-center justify-between gap-4 px-5 py-3">
                <p className="leading-tight">
                    <span className="block text-caption text-ink-muted">
                        {t('product.instapay_from')}
                    </span>
                    <span className="price text-body-l">
                        {product.instapay_label}
                    </span>
                </p>
                {soldOut ? (
                    <span className="flex h-12 items-center rounded-md border border-sand px-6 text-label text-ink-muted">
                        {t('product.sold_out')}
                    </span>
                ) : (
                    <Link
                        href={href}
                        className={buttonClasses('primary')}
                        onClick={() =>
                            track('order_cta_clicked', {
                                cta_location: 'sticky_bar',
                            })
                        }
                    >
                        {t('cta.order')}
                    </Link>
                )}
            </div>
        </div>
    );
}
