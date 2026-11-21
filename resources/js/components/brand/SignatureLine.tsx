import { useInView } from '@/hooks/use-in-view';
import { cn } from '@/lib/utils';

/**
 * The 3px blue signature line. Draws from the reading edge the first time
 * it scrolls into view (600ms); static with reduced motion or without JS.
 */
export function SignatureLine({
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
            className={cn('signature-line', className)}
        />
    );
}
