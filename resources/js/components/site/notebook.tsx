import { cn } from '@/lib/utils';

/**
 * A drawn A5 notebook for one faculty edition: paper cover, ink spine, the
 * edition's overline, its line motif in the edition colour, and the mark
 * with the blue line at the foot.
 */

const MOTIFS: Record<string, string> = {
    // One line drawing per faculty. viewBox is 0 0 200 280.
    medical:
        'M40 150 H78 L86 150 L92 130 L100 174 L108 116 L116 162 L122 150 H168',
    engineering:
        'M48 186 H160 M48 186 V116 M48 116 L104 88 L160 116 M160 116 V186 M104 88 V186',
    pharmacy:
        'M104 100 L130 115 V145 L104 160 L78 145 V115 Z M130 115 L150 103 M78 145 L58 157 M104 160 V182',
    dentistry: 'M62 112 C62 186 84 194 104 194 C124 194 146 186 146 112',
    law: 'M104 96 V188 M68 114 H140 M68 114 L56 148 H80 Z M140 114 L128 148 H152 Z M86 188 H122',
    business: 'M44 184 C80 182 98 166 114 140 C128 118 146 102 166 98',
    arts: 'M46 158 C68 124 90 184 110 150 C128 122 148 136 164 128',
    'computer-science': 'M46 150 H150 M160 138 V162',
};

type Props = {
    designKey: string;
    tint: string;
    /** Shown small at the top of the cover, e.g. "MEDICAL · طب". */
    overline?: string;
    className?: string;
    /** Accessible description; omit when purely decorative. */
    label?: string;
};

export function Notebook({
    designKey,
    tint,
    overline,
    className,
    label,
}: Props) {
    const motif = MOTIFS[designKey] ?? MOTIFS.arts;

    return (
        <svg
            viewBox="0 0 200 280"
            role={label ? 'img' : undefined}
            aria-label={label}
            aria-hidden={label ? undefined : true}
            className={cn('h-auto w-full', className)}
        >
            {/* page block on the fore edge */}
            <rect
                x="12"
                y="10"
                width="182"
                height="264"
                rx="3"
                fill="#E2DDD2"
            />
            {/* paper cover */}
            <rect
                x="8"
                y="6"
                width="182"
                height="264"
                rx="3"
                fill="#FBFAF6"
                stroke="#E2DDD2"
                strokeWidth="1"
            />
            {/* ink spine */}
            <path
                d="M11 6 H26 V270 H11 A3 3 0 0 1 8 267 V9 A3 3 0 0 1 11 6 Z"
                fill="#1C1B19"
            />
            {overline && (
                <text
                    x="108"
                    y="44"
                    textAnchor="middle"
                    fill="#55524C"
                    fontSize="7"
                    fontWeight="600"
                    letterSpacing="0.6"
                    style={{ fontFamily: 'var(--body-font)' }}
                >
                    {overline}
                </text>
            )}
            <path
                key={designKey}
                d={motif}
                fill="none"
                stroke={tint}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                    transition: 'stroke 400ms cubic-bezier(0.2,0.7,0.2,1)',
                }}
            />
            {/* small mark at the foot: nib over the blue line */}
            <g transform="translate(97 226) scale(0.18)">
                <path
                    fillRule="evenodd"
                    fill="#1C1B19"
                    d="M60 96 L38 54 C38 36 48 24 60 14 C72 24 82 36 82 54 Z M60 46 a6 6 0 1 0 0.01 0 Z"
                />
                <path
                    d="M10 104 H110"
                    stroke="#2747D6"
                    strokeWidth="6"
                    strokeLinecap="round"
                />
            </g>
        </svg>
    );
}
