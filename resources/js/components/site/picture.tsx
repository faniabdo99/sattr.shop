import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import type { Image } from '@/types/site';

type Props = {
    image: Image | null | undefined;
    /** Shown inside the plate when no image has been uploaded yet. */
    fallback?: ReactNode;
    /** CSS aspect-ratio, e.g. "4 / 5". Reserves space so nothing shifts. */
    ratio?: string;
    sizes?: string;
    priority?: boolean;
    className?: string;
    imgClassName?: string;
};

/**
 * Responsive image (AVIF, WebP, original) in a fixed-ratio frame.
 * Without an image it renders a paper plate with a hairline frame.
 */
export function Picture({
    image,
    fallback,
    ratio = '4 / 5',
    sizes = '100vw',
    priority = false,
    className,
    imgClassName,
}: Props) {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-lg bg-sand-deep',
                className,
            )}
            style={{ aspectRatio: ratio }}
        >
            {image ? (
                <picture>
                    {image.avif && (
                        <source
                            type="image/avif"
                            srcSet={image.avif}
                            sizes={sizes}
                        />
                    )}
                    {image.webp && (
                        <source
                            type="image/webp"
                            srcSet={image.webp}
                            sizes={sizes}
                        />
                    )}
                    <img
                        src={image.src}
                        alt={image.alt}
                        width={image.width ?? undefined}
                        height={image.height ?? undefined}
                        loading={priority ? 'eager' : 'lazy'}
                        fetchPriority={priority ? 'high' : undefined}
                        decoding={priority ? 'sync' : 'async'}
                        className={cn(
                            'absolute inset-0 h-full w-full object-cover',
                            imgClassName,
                        )}
                    />
                </picture>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                    {fallback}
                </div>
            )}
        </div>
    );
}
