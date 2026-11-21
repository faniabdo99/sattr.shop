import type { ReactNode } from 'react';
import { Button } from '@/components/brand/Button';

type Props = {
    children: ReactNode;
    href?: string;
    type?: 'button' | 'submit';
    variant?: 'solid' | 'ghost' | 'tertiary';
    disabled?: boolean;
    full?: boolean;
    className?: string;
    onClick?: () => void;
};

/** Storefront call to action. Thin wrapper over the brand Button. */
export function Cta({ variant = 'solid', ...props }: Props) {
    const mapped =
        variant === 'solid'
            ? 'primary'
            : variant === 'ghost'
              ? 'secondary'
              : 'tertiary';

    return <Button variant={mapped} {...props} />;
}
