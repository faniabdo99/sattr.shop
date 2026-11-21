import { useT } from '@/hooks/use-t';
import type { Review } from '@/types/site';

/** Rating drawn as five short rules; filled ones are blue. */
export function Rating({ rating, label }: { rating: number; label: string }) {
    return (
        <span role="img" aria-label={label} className="flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
                <span
                    key={n}
                    aria-hidden="true"
                    className={
                        n <= Math.round(rating)
                            ? 'h-0.5 w-5 bg-line'
                            : 'h-0.5 w-5 bg-stone'
                    }
                />
            ))}
        </span>
    );
}

export function ReviewList({ reviews }: { reviews: Review[] }) {
    const t = useT();

    if (reviews.length === 0) {
        return null;
    }

    return (
        <ul className="grid gap-10 md:grid-cols-3 md:gap-8">
            {reviews.map((review) => (
                <li key={review.id}>
                    <figure>
                        <Rating
                            rating={review.rating}
                            label={t('reviews.rating_label', {
                                rating: review.rating,
                            })}
                        />
                        <blockquote className="display mt-5 text-xl leading-snug">
                            {review.body}
                        </blockquote>
                        <figcaption className="mt-4 text-sm text-ink-soft">
                            {review.name}
                            {review.date ? `, ${review.date}` : ''}
                        </figcaption>
                    </figure>
                </li>
            ))}
        </ul>
    );
}
