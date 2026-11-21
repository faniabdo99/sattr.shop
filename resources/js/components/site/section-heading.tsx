import type { ReactNode } from 'react';
import { SignatureLine } from '@/components/brand/SignatureLine';
import { cn } from '@/lib/utils';

/**
 * Section opener, always in this order:
 * overline → signature line → display headline → body-l.
 */
export function SectionHeading({
    overline,
    title,
    lede,
    id,
    className,
    as: Tag = 'h2',
}: {
    overline?: ReactNode;
    title: ReactNode;
    lede?: ReactNode;
    id?: string;
    className?: string;
    as?: 'h1' | 'h2';
}) {
    return (
        <header className={cn('mb-8 md:mb-12', className)}>
            {overline && <p className="mb-3 overline">{overline}</p>}
            <SignatureLine className="max-w-24" />
            <Tag id={id} className="display mt-6 max-w-3xl text-display-l">
                {title}
            </Tag>
            {lede && (
                <p className="measure mt-4 text-body-l text-ink-muted">
                    {lede}
                </p>
            )}
        </header>
    );
}
