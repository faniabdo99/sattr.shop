import { Link } from '@inertiajs/react';
import { useT } from '@/hooks/use-t';
import type { Product } from '@/types/site';

/** Thumb-reach order bar on phones. Hidden from md up. */
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
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-stone bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
            <div className="flex items-center justify-between gap-4 px-5 py-3">
                <p className="leading-tight">
                    <span className="block text-sm text-ink-soft">
                        {t('product.instapay_from')}
                    </span>
                    <span className="font-medium">
                        {product.instapay_label}
                    </span>
                </p>
                {soldOut ? (
                    <span className="flex min-h-12 items-center bg-stone px-8 font-medium text-ink-soft">
                        {t('product.sold_out')}
                    </span>
                ) : (
                    <Link
                        href={href}
                        className="flex min-h-12 items-center bg-line px-8 font-medium text-paper"
                    >
                        {t('cta.order')}
                    </Link>
                )}
            </div>
        </div>
    );
}
