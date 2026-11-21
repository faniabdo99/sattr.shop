import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'info' | 'ok' | 'warn' | 'danger';

const tones: Record<Tone, string> = {
    neutral: 'border-sand bg-transparent text-ink-muted',
    info: 'border-line/30 bg-line/5 text-line',
    ok: 'border-success/30 bg-success/5 text-success',
    warn: 'border-[#8a5a3c]/30 bg-[#8a5a3c]/5 text-[#8a5a3c]',
    danger: 'border-danger/30 bg-danger/5 text-danger',
};

const map: Record<string, Tone> = {
    // Order status
    pending: 'warn',
    confirmed: 'info',
    processing: 'info',
    shipped: 'info',
    delivered: 'ok',
    cancelled: 'danger',
    returned: 'danger',
    // Payment status
    unpaid: 'neutral',
    awaiting_verification: 'warn',
    paid: 'ok',
    refunded: 'danger',
    // Payment records and reviews
    submitted: 'warn',
    verified: 'ok',
    approved: 'ok',
    rejected: 'danger',
    // Content
    published: 'ok',
    draft: 'neutral',
    active: 'ok',
    inactive: 'neutral',
    noindex: 'warn',
    flagged: 'danger',
};

function humanise(value: string): string {
    const text = value.replaceAll('_', ' ');

    return text.charAt(0).toUpperCase() + text.slice(1);
}

type Props = {
    /** Machine value, e.g. `awaiting_verification`; picks the colour. */
    value: string;
    /** Display text; defaults to a humanised `value`. */
    label?: string;
    tone?: Tone;
    className?: string;
};

export function StatusBadge({ value, label, tone, className }: Props) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-sm border px-1.5 py-0.5 text-xs leading-none font-medium whitespace-nowrap',
                tones[tone ?? map[value] ?? 'neutral'],
                className,
            )}
        >
            {label ?? humanise(value)}
        </span>
    );
}
