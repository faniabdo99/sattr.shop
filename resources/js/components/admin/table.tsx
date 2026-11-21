import type { ComponentProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Hairline-divided data table inside a scroll container. */
export function Table({
    caption,
    className,
    children,
}: {
    caption: string;
    className?: string;
    children: ReactNode;
}) {
    return (
        <div
            className={cn(
                'overflow-x-auto rounded-md border border-border bg-card',
                className,
            )}
        >
            <table className="w-full border-collapse text-sm">
                <caption className="sr-only">{caption}</caption>
                {children}
            </table>
        </div>
    );
}

export function Th({
    className,
    numeric,
    ...props
}: ComponentProps<'th'> & { numeric?: boolean }) {
    return (
        <th
            scope="col"
            className={cn(
                'border-b border-border px-3 py-2 text-xs font-medium whitespace-nowrap text-muted-foreground',
                numeric ? 'text-right' : 'text-left',
                className,
            )}
            {...props}
        />
    );
}

export function Td({
    className,
    numeric,
    ...props
}: ComponentProps<'td'> & { numeric?: boolean }) {
    return (
        <td
            className={cn(
                'px-3 py-2.5 align-middle',
                numeric && 'text-right tabular-nums',
                className,
            )}
            {...props}
        />
    );
}

export const rowClass = 'border-b border-border last:border-b-0';

export function EmptyState({
    title,
    children,
}: {
    title: string;
    children?: ReactNode;
}) {
    return (
        <div className="rounded-md border border-dashed border-border px-6 py-12 text-center">
            <p className="text-sm font-medium">{title}</p>
            {children && (
                <div className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                    {children}
                </div>
            )}
        </div>
    );
}
