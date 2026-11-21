import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Notebook } from '@/components/site/notebook';
import { Picture } from '@/components/site/picture';
import { useT } from '@/hooks/use-t';
import type { Design } from '@/types/site';

/**
 * The notebook cover for the chosen faculty design. Uses the uploaded cover
 * mock-up when there is one, otherwise the drawn notebook.
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
            <div className="relative bg-paper-deep px-[16%] py-[10%]">
                <span className="absolute inset-3 border border-ink/10 sm:inset-4" />
                <AnimatePresence mode="popLayout" initial={false}>
                    <motion.div
                        key={design.key}
                        initial={reduce ? false : { opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={reduce ? undefined : { opacity: 0 }}
                        transition={{
                            duration: 0.7,
                            ease: [0.22, 0.61, 0.36, 1],
                        }}
                        className="relative"
                    >
                        {design.cover ? (
                            <Picture
                                image={{ ...design.cover, alt: label }}
                                ratio="5 / 7"
                                sizes="(min-width: 1024px) 30vw, 70vw"
                            />
                        ) : (
                            <Notebook
                                designKey={design.key}
                                tint={design.tint}
                                label={label}
                                className="drop-shadow-[0_18px_24px_rgba(28,27,25,0.18)]"
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
            <p className="mt-3 text-sm text-ink-soft" aria-live="polite">
                {design.name}
                {design.motif ? `: ${design.motif}` : ''}
            </p>
        </div>
    );
}

/** The message card that travels in the box. */
export function MessageCard({ message }: { message: string }) {
    const t = useT();

    return (
        <div className="border border-stone bg-[#FBFAF7] p-6 sm:p-8">
            <p className="display min-h-24 text-xl leading-relaxed whitespace-pre-line text-ink">
                {message.trim() || (
                    <span className="text-ink/30">
                        {t('product.gift_message_placeholder')}
                    </span>
                )}
            </p>
            <span className="mt-6 block h-px w-16 bg-line" />
        </div>
    );
}
