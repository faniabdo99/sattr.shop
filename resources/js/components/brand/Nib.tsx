import { cn } from '@/lib/utils';

/** The nib alone, as a small ink mark: list bullets and the loader. */
export function Nib({ className }: { className?: string }) {
    return (
        <svg
            viewBox="30 10 60 90"
            aria-hidden="true"
            className={cn('h-4 w-auto', className)}
        >
            <path
                fillRule="evenodd"
                fill="currentColor"
                d="M60 96 L38 54 C38 36 48 24 60 14 C72 24 82 36 82 54 Z M60 46 a6 6 0 1 0 0.01 0 Z"
            />
        </svg>
    );
}

/**
 * Loading indicator: the nib with the blue line drawing underneath.
 * `once` plays it a single time (thank-you page) instead of looping.
 */
export function NibLoader({
    size = 48,
    once = false,
    label,
    className,
}: {
    size?: number;
    once?: boolean;
    label?: string;
    className?: string;
}) {
    return (
        <span
            role={label ? 'status' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={cn('inline-block', once && 'nib-loader-once', className)}
        >
            <svg viewBox="0 0 120 120" width={size} height={size}>
                <path
                    fillRule="evenodd"
                    fill="var(--ink)"
                    d="M60 96 L38 54 C38 36 48 24 60 14 C72 24 82 36 82 54 Z M60 46 a6 6 0 1 0 0.01 0 Z"
                />
                <path
                    className="nib-loader-line"
                    d="M10 104 H110"
                    stroke="var(--line)"
                    strokeWidth="6"
                    strokeLinecap="round"
                    fill="none"
                />
            </svg>
        </span>
    );
}
