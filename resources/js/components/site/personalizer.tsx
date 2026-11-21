import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { RuledLine } from '@/components/brand/RuledLine';
import { editionOverline } from '@/components/site/design-picker';
import { Notebook } from '@/components/site/notebook';
import { Picture } from '@/components/site/picture';
import { useT } from '@/hooks/use-t';
import { cn } from '@/lib/utils';
import type { Design } from '@/types/site';

/**
 * The notebook cover for the chosen edition on a sand-deep frame, with a
 * crossfade when the edition changes. Uses the uploaded cover mock-up when
 * there is one, otherwise the drawn notebook.
 */
export function CoverPreview({
    design,
    className,
}: {
    design: Design;
    className?: string;
}) {
    const t = useT();
    const reduce = useReducedMotion();
    const label = t('product.preview_label_blank', { design: design.name });

    return (
        <div className={className}>
            <div className="relative overflow-hidden rounded-lg bg-sand-deep px-[18%] py-[10%]">
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={design.key}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.2, 0.7, 0.2, 1] }}
                        className="relative"
                    >
                        {design.cover ? (
                            <Picture
                                image={{ ...design.cover, alt: label }}
                                ratio="5 / 7"
                                sizes="(min-width: 1024px) 30vw, 70vw"
                                className="rounded-sm shadow-product"
                            />
                        ) : (
                            <Notebook
                                designKey={design.key}
                                tint={design.tint}
                                overline={editionOverline(design)}
                                label={label}
                                className="drop-shadow-[0_30px_24px_rgb(28_27_25_/_0.28)]"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <p className="mt-3 text-caption text-ink-muted" aria-live="polite">
                {design.name}
                {design.motif ? `: ${design.motif}` : ''}
            </p>
        </div>
    );
}

/** The To/From card that travels in the box, written on ruled lines. */
export function MessageCard({
    message,
    className,
}: {
    message: string;
    className?: string;
}) {
    const t = useT();
    const text = message.trim();

    return (
        <div
            className={cn(
                'rounded-lg border border-sand bg-paper-raised p-4 md:p-6',
                className,
            )}
        >
            <p className="text-caption text-ink-muted">
                {t('product.card_to')}
            </p>
            <RuledLine className="mt-5" />
            <p
                className={cn(
                    'display mt-5 min-h-21 text-xl leading-9 whitespace-pre-line',
                    text ? 'text-ink' : 'text-ink-muted',
                )}
            >
                {text || t('product.gift_message_placeholder')}
            </p>
            <RuledLine />
            <p className="mt-4 text-caption text-ink-muted">
                {t('product.card_from')}
            </p>
            <RuledLine className="mt-5 max-w-40" />
        </div>
    );
}
