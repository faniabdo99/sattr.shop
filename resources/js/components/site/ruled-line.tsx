import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

/**
 * The brand's signature: one thin horizontal rule. With `draw` it draws
 * itself from the reading edge when it scrolls into view.
 */
export function RuledLine({
    draw = true,
    className,
}: {
    draw?: boolean;
    className?: string;
}) {
    const ref = useInView<HTMLSpanElement>();

    return (
        <span
            ref={ref}
            aria-hidden="true"
            data-draw={draw ? '' : undefined}
            className={cn('ruled text-line', className)}
        />
    );
}
