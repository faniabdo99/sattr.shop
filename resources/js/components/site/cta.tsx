import { Link } from '@inertiajs/react';
import {
    motion,
    useMotionValue,
    useReducedMotion,
    useSpring,
} from 'motion/react';
import type { PointerEvent, ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    children: ReactNode;
    href?: string;
    type?: 'button' | 'submit';
    variant?: 'solid' | 'ghost';
    disabled?: boolean;
    full?: boolean;
    className?: string;
    onClick?: () => void;
};

const base =
    'inline-flex min-h-13 items-center justify-center px-8 text-[0.9375rem] font-medium transition-colors duration-300 disabled:cursor-not-allowed';

const variants = {
    solid: 'bg-line text-paper hover:bg-line-deep disabled:bg-stone disabled:text-ink-soft',
    ghost: 'border border-ink/25 text-ink hover:border-ink',
};

/** Primary action. Leans slightly toward the pointer on hover. */
export function Cta({
    children,
    href,
    type = 'button',
    variant = 'solid',
    disabled,
    full,
    className,
    onClick,
}: Props) {
    const reduce = useReducedMotion();
    const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });
    const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18 });

    const move = (event: PointerEvent<HTMLElement>) => {
        if (reduce || disabled || event.pointerType === 'touch') {
            return;
        }

        const box = event.currentTarget.getBoundingClientRect();

        x.set((event.clientX - (box.left + box.width / 2)) * 0.12);
        y.set((event.clientY - (box.top + box.height / 2)) * 0.2);
    };

    const leave = () => {
        x.set(0);
        y.set(0);
    };

    const classes = cn(base, variants[variant], full && 'w-full', className);

    return (
        <motion.span
            style={{ x, y }}
            onPointerMove={move}
            onPointerLeave={leave}
            className={cn('inline-block', full && 'block w-full')}
        >
            {href && !disabled ? (
                <Link href={href} className={classes} onClick={onClick}>
                    {children}
                </Link>
            ) : (
                <button
                    type={type}
                    disabled={disabled}
                    className={classes}
                    onClick={onClick}
                >
                    {children}
                </button>
            )}
        </motion.span>
    );
}
