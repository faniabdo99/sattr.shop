import type { ReactNode } from 'react';
import { useInView } from '@/hooks/use-in-view';

/** Quiet entrance for below-the-fold blocks. Never use above the fold. */
export function Reveal({
    children,
    className,
    delay = 0,
}: {
    children: ReactNode;
    className?: string;
    delay?: number;
}) {
    const ref = useInView<HTMLDivElement>();

    return (
        <div
            ref={ref}
            data-reveal=""
            className={className}
            style={delay ? { transitionDelay: `${delay}ms` } : undefined}
        >
            {children}
        </div>
    );
}
