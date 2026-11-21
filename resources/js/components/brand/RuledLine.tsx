import { cn } from '@/lib/utils';

/** The 1.5px ink "write here" line: message cards and To/From fields. */
export function RuledLine({ className }: { className?: string }) {
    return <span aria-hidden="true" className={cn('ruled-line', className)} />;
}
