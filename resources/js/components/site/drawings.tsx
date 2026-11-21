/**
 * Line drawings used on plates until photographs are uploaded in the admin.
 * Ink strokes only, with the blue line as the single accent.
 */

const stroke = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
};

export function BoxClosed({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 240 180" aria-hidden="true" className={className}>
            <path {...stroke} d="M40 70 L120 40 L200 70 L120 100 Z" />
            <path {...stroke} d="M40 70 V128 L120 158 V100" />
            <path {...stroke} d="M200 70 V128 L120 158" />
            <path {...stroke} d="M40 84 L120 114 L200 84" />
            <path
                d="M80 55 L160 85"
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="1"
            />
        </svg>
    );
}

export function BoxLid({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 240 180" aria-hidden="true" className={className}>
            <path {...stroke} d="M40 96 V136 L120 166 V126" />
            <path {...stroke} d="M200 96 V136 L120 166" />
            <path {...stroke} d="M40 96 L120 126 L200 96 L120 66 Z" />
            <path {...stroke} d="M52 44 L132 14 L212 44 L132 74 Z" />
            <path {...stroke} d="M52 44 V56 L132 86 L212 56 V44" />
            <path {...stroke} d="M92 90 L128 78 L150 86 L114 98 Z" />
            <path
                d="M102 91 L136 80"
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="1"
            />
        </svg>
    );
}

export function BoxContents({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 240 180" aria-hidden="true" className={className}>
            {/* notebook */}
            <rect {...stroke} x="28" y="30" width="78" height="112" />
            <path {...stroke} d="M36 30 V142" />
            <path
                d="M48 118 H96"
                fill="none"
                stroke="var(--color-line)"
                strokeWidth="1"
            />
            {/* mug */}
            <path {...stroke} d="M128 38 H178 V92 H128 Z" />
            <path {...stroke} d="M178 50 C198 50 198 80 178 80" />
            {/* coasters */}
            <rect {...stroke} x="128" y="108" width="34" height="34" />
            <rect {...stroke} x="134" y="114" width="34" height="34" />
            <rect {...stroke} x="140" y="120" width="34" height="34" />
            {/* pen */}
            <path
                {...stroke}
                d="M196 104 L214 104 L214 156 L205 166 L196 156 Z"
            />
            <path {...stroke} d="M196 116 H214" />
        </svg>
    );
}
