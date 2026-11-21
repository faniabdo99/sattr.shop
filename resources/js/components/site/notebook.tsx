import { cn } from '@/lib/utils';

/**
 * A drawn A5 notebook cover in the faculty's colour, with its line motif
 * and the customer's name set where it will be printed.
 */

const MOTIFS: Record<string, string> = {
    // One line drawing per faculty. viewBox is 0 0 200 280.
    medical:
        'M24 150 H72 L82 150 L90 128 L100 176 L110 112 L120 162 L128 150 H176',
    engineering:
        'M36 190 H164 M36 190 V110 M36 110 L100 78 L164 110 M164 110 V190 M100 78 V190 M24 204 H176',
    pharmacy:
        'M100 96 L130 113 V147 L100 164 L70 147 V113 Z M130 113 L154 99 M70 147 L46 161 M100 164 V190',
    dentistry: 'M52 112 C52 196 78 204 100 204 C122 204 148 196 148 112',
    law: 'M100 92 V196 M60 112 H140 M60 112 L46 150 H74 Z M140 112 L126 150 H154 Z M78 196 H122',
    business: 'M30 190 C70 188 92 170 110 140 C126 114 146 96 172 92',
    arts: 'M34 160 C60 120 84 190 108 150 C128 118 150 134 168 126',
    'computer-science': 'M32 150 H150 M160 136 V164',
};

type Props = {
    designKey: string;
    tint: string;
    name?: string;
    className?: string;
    /** Accessible description; omit when purely decorative. */
    label?: string;
};

export function Notebook({ designKey, tint, name, className, label }: Props) {
    const motif = MOTIFS[designKey] ?? MOTIFS.arts;
    const shown = (name ?? '').trim();

    return (
        <svg
            viewBox="0 0 200 280"
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={cn('h-auto w-full', className)}
        >
            {/* page block peeking out on the fore edge */}
            <rect x="12" y="10" width="180" height="264" fill="#EFEADF" />
            <rect
                x="8"
                y="6"
                width="180"
                height="264"
                fill={tint}
                style={{
                    transition: 'fill 0.7s cubic-bezier(0.22,0.61,0.36,1)',
                }}
            />
            {/* spine */}
            <rect
                x="8"
                y="6"
                width="12"
                height="264"
                fill="#000"
                opacity="0.14"
            />
            <path
                key={designKey}
                d={motif}
                fill="none"
                stroke="#F6F3EC"
                strokeWidth="1.1"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.9"
            />
            <line
                x1="36"
                y1="232"
                x2="164"
                y2="232"
                stroke="#F6F3EC"
                strokeWidth="0.5"
                opacity="0.5"
            />
            <text
                x="100"
                y="250"
                textAnchor="middle"
                fill="#F6F3EC"
                fontSize={shown.length > 14 ? 9 : 11}
                style={{ fontFamily: 'var(--display-font)' }}
            >
                {shown}
            </text>
        </svg>
    );
}
