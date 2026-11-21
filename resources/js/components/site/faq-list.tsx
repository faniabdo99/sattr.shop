import { Minus, Plus } from 'lucide-react';
import type { Faq } from '@/types/site';

/** Accordion on native <details>: answers stay in the HTML for crawlers. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
    return (
        <div className="border-t border-sand">
            {faqs.map((faq) => (
                <details key={faq.id} className="group border-b border-sand">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-4 [&::-webkit-details-marker]:hidden">
                        <h3 className="text-body-l font-semibold">
                            {faq.question}
                        </h3>
                        <span aria-hidden="true" className="shrink-0 text-ink">
                            <Plus
                                size={20}
                                strokeWidth={1.5}
                                className="group-open:hidden"
                            />
                            <Minus
                                size={20}
                                strokeWidth={1.5}
                                className="hidden group-open:block"
                            />
                        </span>
                    </summary>
                    <p className="measure pb-6 text-ink-muted">{faq.answer}</p>
                </details>
            ))}
        </div>
    );
}
