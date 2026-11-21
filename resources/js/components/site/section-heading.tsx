import type { ReactNode } from 'react';
import { RuledLine } from '@/components/site/ruled-line';
import { cn } from '@/lib/utils';

/** Section opener: the line draws in, then the heading sits under it. */
export function SectionHeading({
    title,
    lede,
    id,
    className,
    as: Tag = 'h2',
}: {
    title: ReactNode;
    lede?: ReactNode;
    id?: string;
    className?: string;
    as?: 'h1' | 'h2';
}) {
    return (
        <header className={cn('mb-12 md:mb-16', className)}>
            <RuledLine />
            <div className="mt-8 grid gap-6 md:grid-cols-12 md:gap-8">
                <Tag id={id} className="display text-display-lg md:col-span-7">
                    {title}
                </Tag>
                {lede && (
                    <p className="text-lede text-ink-soft md:col-span-4 md:col-start-9 md:pt-3">
                        {lede}
                    </p>
                )}
            </div>
        </header>
    );
}
