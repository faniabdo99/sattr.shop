import { Check } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Radio card: raised paper, hairline sand border, radius-lg.
 * Selected = 1.5px ink border plus a blue check.
 */
export function RadioCard({
    name,
    value,
    checked,
    disabled,
    onChange,
    children,
    className,
}: {
    name: string;
    value: string;
    checked: boolean;
    disabled?: boolean;
    onChange: () => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <label
            className={cn(
                'relative flex cursor-pointer rounded-lg border bg-paper-raised p-4 transition-colors duration-300 has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-line md:p-6',
                checked
                    ? 'border-ink ring-[0.5px] ring-ink'
                    : 'border-sand hover:border-ink-muted',
                disabled && 'cursor-not-allowed opacity-55',
                className,
            )}
        >
            <input
                type="radio"
                name={name}
                value={value}
                checked={checked}
                disabled={disabled}
                onChange={onChange}
                className="sr-only"
            />
            <span className="min-w-0 flex-1">{children}</span>
            <span
                aria-hidden="true"
                className={cn(
                    'ms-3 flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors duration-300',
                    checked
                        ? 'border-line bg-line text-on-line'
                        : 'border-sand',
                )}
            >
                {checked && <Check size={14} strokeWidth={2.5} />}
            </span>
        </label>
    );
}
