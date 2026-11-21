import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Offer badge (pill). For offers only, e.g. "InstaPay −10%". Ink on paper
 * grounds; use tone="line" on ink grounds.
 */
export function Badge({
    children,
    tone = 'ink',
    className,
}: {
    children: ReactNode;
    tone?: 'ink' | 'line';
    className?: string;
}) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-pill px-3 py-1 text-caption font-semibold whitespace-nowrap',
                tone === 'ink' ? 'bg-ink text-paper' : 'bg-line text-on-line',
                className,
            )}
        >
            {children}
        </span>
    );
}
