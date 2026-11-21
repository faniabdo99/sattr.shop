import type { Faq } from '@/types/site';

/** Native disclosure: answers are in the HTML for crawlers and no-JS readers. */
export function FaqList({ faqs }: { faqs: Faq[] }) {
    return (
        <div className="border-t border-stone">
            {faqs.map((faq) => (
                <details key={faq.id} className="group border-b border-stone">
                    <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-lg [&::-webkit-details-marker]:hidden">
                        <h3 className="font-normal">{faq.question}</h3>
                        <span
                            aria-hidden="true"
                            className="relative size-3 shrink-0"
                        >
                            <span className="absolute inset-x-0 top-1/2 h-px bg-ink" />
                            <span className="absolute inset-y-0 start-1/2 w-px bg-ink transition-transform duration-500 group-open:scale-y-0" />
                        </span>
                    </summary>
                    <p className="measure pb-7 text-ink-soft">{faq.answer}</p>
                </details>
            ))}
        </div>
    );
}
