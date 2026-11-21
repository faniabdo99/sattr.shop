import { useId } from 'react';
import { cn } from '@/lib/utils';

type Variant = 'lockup' | 'lockup-ar' | 'mark' | 'avatar';
type Tone = 'light' | 'dark';

type Props = {
    variant?: Variant;
    /** "light" sits on paper, "dark" sits on ink. */
    tone?: Tone;
    /** Height of the mark in px. Minimum 16; a lockup needs at least 28 to reach 96px wide. */
    size?: number;
    className?: string;
    /** Set false when a visible label already names the brand. */
    labelled?: boolean;
};

const TONES: Record<Tone, { nib: string; line: string; text: string }> = {
    light: { nib: '#1C1B19', line: '#2747D6', text: '#1C1B19' },
    dark: { nib: '#F6F3EC', line: '#8EA0FF', text: '#F6F3EC' },
};

/**
 * The nib is cut out with a mask so the ground shows through. The nib is
 * always ink (paper on dark) and the line always blue.
 */
function Mark({
    tone,
    size,
    title,
}: {
    tone: Tone;
    size: number;
    title?: string;
}) {
    const maskId = useId();
    const colors = TONES[tone];

    return (
        <svg
            viewBox="0 0 120 120"
            width={size}
            height={size}
            role={title ? 'img' : undefined}
            aria-label={title}
            aria-hidden={title ? undefined : true}
            className="shrink-0"
        >
            <defs>
                <mask id={maskId}>
                    <rect width="120" height="120" fill="#fff" />
                    <path
                        d="M60 92 V58"
                        stroke="#000"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <circle cx="60" cy="52" r="6" fill="#000" />
                </mask>
            </defs>
            <path
                d="M60 96 L38 54 C38 36 48 24 60 14 C72 24 82 36 82 54 Z"
                fill={colors.nib}
                mask={`url(#${maskId})`}
            />
            <path
                d="M10 104 H110"
                stroke={colors.line}
                strokeWidth="6"
                strokeLinecap="round"
                fill="none"
            />
        </svg>
    );
}

/**
 * Sattr logo. The lockup is never mirrored: the wordmark sits to the right
 * of the mark in both LTR and RTL.
 */
export function Logo({
    variant = 'lockup',
    tone = 'light',
    size = 32,
    className,
    labelled = true,
}: Props) {
    const mark = Math.max(16, size);
    const label = labelled ? 'Sattr' : undefined;

    if (variant === 'mark') {
        return (
            <span className={cn('inline-flex', className)}>
                <Mark tone={tone} size={mark} title={label} />
            </span>
        );
    }

    if (variant === 'avatar') {
        // Rounded ink square carrying the paper and blue mark.
        return (
            <span
                role={labelled ? 'img' : undefined}
                aria-label={label}
                className={cn(
                    'inline-flex items-center justify-center rounded-[22%]',
                    className,
                )}
                style={{
                    width: mark,
                    height: mark,
                    backgroundColor: '#1C1B19',
                }}
            >
                <Mark tone="dark" size={Math.round(mark * 0.68)} />
            </span>
        );
    }

    const arabic = variant === 'lockup-ar';

    return (
        <span
            dir="ltr"
            role={labelled ? 'img' : undefined}
            aria-label={label}
            className={cn('inline-flex items-center', className)}
            style={{ gap: Math.round(mark * 0.28), color: TONES[tone].text }}
        >
            <Mark tone={tone} size={mark} />
            <span
                aria-hidden="true"
                lang={arabic ? 'ar' : 'en'}
                style={{
                    fontFamily: arabic
                        ? "var(--font-ibm-plex-sans-arabic), 'Geeza Pro', sans-serif"
                        : 'var(--font-inter-tight), ui-sans-serif, system-ui, sans-serif',
                    fontWeight: 600,
                    fontSize: Math.round(mark * (arabic ? 0.82 : 0.78)),
                    letterSpacing: arabic ? 0 : '-0.025em',
                    lineHeight: 1,
                }}
            >
                {arabic ? 'سطر' : 'sattr'}
            </span>
        </span>
    );
}
