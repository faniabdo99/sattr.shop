import { useEffect, useRef } from 'react';

/**
 * Marks an element with data-inview the first time it enters the viewport.
 * The hidden "before" state lives in CSS behind the .js class, so content
 * stays visible in server HTML and without JavaScript.
 */
export function useInView<T extends HTMLElement>(margin = '0px 0px -12% 0px') {
    const ref = useRef<T>(null);

    useEffect(() => {
        const element = ref.current;

        if (!element) {
            return;
        }

        if (!('IntersectionObserver' in window)) {
            element.setAttribute('data-inview', '');

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.setAttribute('data-inview', '');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { rootMargin: margin },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [margin]);

    return ref;
}
