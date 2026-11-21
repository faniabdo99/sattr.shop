import { useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Picture } from '@/components/site/picture';
import { useT } from '@/hooks/use-t';
import type { Image } from '@/types/site';

/**
 * Stacked photographs. Each opens full size in a dialog (click or Enter),
 * closed with Escape, the close button or a click on the backdrop.
 */
export function Gallery({
    images,
    empty,
    sizes = '(min-width: 1024px) 55vw, 100vw',
}: {
    images: Image[];
    empty?: ReactNode;
    sizes?: string;
}) {
    const t = useT();
    const dialog = useRef<HTMLDialogElement>(null);
    const [active, setActive] = useState<Image | null>(null);

    const open = (image: Image) => {
        setActive(image);
        dialog.current?.showModal();
    };

    if (images.length === 0) {
        return <>{empty}</>;
    }

    return (
        <>
            <ul className="grid gap-4 sm:grid-cols-2">
                {images.map((image, index) => (
                    <li
                        key={image.id}
                        className={
                            index % 3 === 0 ? 'sm:col-span-2' : undefined
                        }
                    >
                        <button
                            type="button"
                            onClick={() => open(image)}
                            aria-label={`${t('product.zoom')}: ${image.alt}`}
                            className="group block w-full cursor-zoom-in"
                        >
                            <Picture
                                image={image}
                                ratio={index % 3 === 0 ? '4 / 3' : '4 / 5'}
                                sizes={
                                    index % 3 === 0
                                        ? sizes
                                        : '(min-width: 1024px) 28vw, 50vw'
                                }
                                priority={index === 0}
                                imgClassName="transition-transform duration-[1200ms] ease-quiet group-hover:scale-[1.02]"
                            />
                        </button>
                    </li>
                ))}
            </ul>

            <dialog
                ref={dialog}
                onClick={(event) => {
                    if (event.target === dialog.current) {
                        dialog.current?.close();
                    }
                }}
                onClose={() => setActive(null)}
                className="m-0 h-dvh max-h-none w-screen max-w-none bg-paper p-0 backdrop:bg-ink/60"
            >
                {active && (
                    <div className="flex h-full flex-col">
                        <div className="flex items-center justify-between gap-6 px-5 py-4">
                            <p className="text-sm text-ink-soft">
                                {active.alt}
                            </p>
                            <button
                                type="button"
                                autoFocus
                                onClick={() => dialog.current?.close()}
                                className="min-h-11 px-3 text-sm font-medium underline underline-offset-4"
                            >
                                {t('product.close')}
                            </button>
                        </div>
                        <div className="min-h-0 flex-1 overflow-auto p-4">
                            <img
                                src={active.src}
                                alt={active.alt}
                                className="mx-auto h-full w-auto max-w-none cursor-zoom-out object-contain"
                                onClick={() => dialog.current?.close()}
                            />
                        </div>
                    </div>
                )}
            </dialog>
        </>
    );
}
