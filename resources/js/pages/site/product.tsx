import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/site/article-card';
import { FaqList } from '@/components/site/faq-list';
import { Gallery } from '@/components/site/gallery';
import { OrderPanel, checkoutUrl } from '@/components/site/order-panel';
import { CoverPreview } from '@/components/site/personalizer';
import { Rating, ReviewList } from '@/components/site/review-list';
import { SectionHeading } from '@/components/site/section-heading';
import { StickyOrderBar } from '@/components/site/sticky-order-bar';
import { useT } from '@/hooks/use-t';
import { track } from '@/lib/track';
import type {
    ArticleCard as Article,
    Design,
    Faq,
    Product,
    Review,
} from '@/types/site';

type Props = {
    product: Product;
    designs: Design[];
    faqs: Faq[];
    reviews: Review[];
    rating: { value: number; count: number } | null;
    articles: Article[];
};

export default function ProductPage({
    product,
    designs,
    faqs,
    reviews,
    rating,
    articles,
}: Props) {
    const t = useT();
    const first =
        designs.find((design) => !design.sold_out) ?? designs[0] ?? null;
    const [designKey, setDesignKey] = useState(first?.key ?? null);
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const design = designs.find((item) => item.key === designKey) ?? first;

    useEffect(() => {
        track('view_item', {
            value: product.price / 100,
            items: [
                {
                    item_id: 'gift-pack',
                    item_name: product.name,
                    price: product.price / 100,
                    quantity: 1,
                },
            ],
        });
    }, [product.name, product.price]);

    const choose = (key: string) => {
        setDesignKey(key);
        track('select_design', { design: key });
    };

    const images = [...(design?.images ?? []), ...product.gallery];

    return (
        <>
            <div className="wrap grid gap-10 pt-8 pb-16 lg:grid-cols-12 lg:gap-8 lg:pt-14 lg:pb-28">
                <div className="lg:col-span-7">
                    {design && (
                        <CoverPreview
                            design={design}
                            name={name}
                            className="mb-4"
                        />
                    )}
                    <Gallery images={images} />
                </div>

                <div className="lg:col-span-4 lg:col-start-9">
                    <div className="lg:sticky lg:top-8">
                        <OrderPanel
                            product={product}
                            designs={designs}
                            design={design}
                            onDesign={choose}
                            name={name}
                            onName={setName}
                            message={message}
                            onMessage={setMessage}
                            heading={
                                <div>
                                    <h1 className="display text-display-lg">
                                        {product.name}
                                    </h1>
                                    <p className="mt-3 text-lede text-ink-soft">
                                        {product.tagline}
                                    </p>
                                    {rating && (
                                        <a
                                            href="#reviews"
                                            className="mt-4 flex items-center gap-3 text-sm text-ink-soft"
                                        >
                                            <Rating
                                                rating={rating.value}
                                                label={t(
                                                    'product.reviews_summary',
                                                    rating,
                                                )}
                                            />
                                            <span aria-hidden="true">
                                                {t(
                                                    'product.reviews_summary',
                                                    rating,
                                                )}
                                            </span>
                                        </a>
                                    )}
                                </div>
                            }
                        />
                    </div>
                </div>
            </div>

            <section
                aria-labelledby="about-title"
                className="wrap py-16 md:py-24"
            >
                <SectionHeading
                    id="about-title"
                    title={t('product.contents')}
                    lede={product.description}
                />
                <div className="grid gap-12 md:grid-cols-2 md:gap-8">
                    <dl>
                        {product.contents.map((item) => (
                            <div
                                key={item.title}
                                className="border-b border-stone py-5 first:border-t"
                            >
                                <dt className="display text-display-sm">
                                    {item.title}
                                </dt>
                                <dd className="mt-1 text-ink-soft">
                                    {item.detail}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    <div>
                        <h2 className="text-sm font-medium">
                            {t('product.specs')}
                        </h2>
                        <table className="mt-4 w-full text-start text-[0.9375rem]">
                            <tbody>
                                {product.specs.map((spec) => (
                                    <tr
                                        key={spec.label}
                                        className="border-b border-stone first:border-t"
                                    >
                                        <th
                                            scope="row"
                                            className="py-4 pe-4 text-start font-normal text-ink-soft"
                                        >
                                            {spec.label}
                                        </th>
                                        <td className="py-4">{spec.value}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </section>

            {reviews.length > 0 && (
                <section
                    id="reviews"
                    aria-labelledby="reviews-title"
                    className="wrap scroll-mt-8 py-16 md:py-24"
                >
                    <SectionHeading
                        id="reviews-title"
                        title={t('product.reviews_title')}
                        lede={
                            rating
                                ? t('product.reviews_summary', rating)
                                : undefined
                        }
                    />
                    <ReviewList reviews={reviews} />
                </section>
            )}

            {faqs.length > 0 && (
                <section
                    aria-labelledby="faq-title"
                    className="wrap py-16 md:py-24"
                >
                    <SectionHeading
                        id="faq-title"
                        title={t('product.faq_title')}
                    />
                    <div className="max-w-3xl">
                        <FaqList faqs={faqs} />
                    </div>
                </section>
            )}

            {articles.length > 0 && (
                <section
                    aria-labelledby="related-title"
                    className="wrap py-16 md:py-24"
                >
                    <SectionHeading
                        id="related-title"
                        title={t('product.related_title')}
                    />
                    <div className="grid gap-12 md:grid-cols-3 md:gap-8">
                        {articles.map((article) => (
                            <ArticleCard key={article.url} article={article} />
                        ))}
                    </div>
                </section>
            )}

            <StickyOrderBar
                product={product}
                href={checkoutUrl(
                    product.checkout_url,
                    design?.key,
                    name,
                    message,
                )}
                soldOut={product.sold_out || (design?.sold_out ?? false)}
            />
        </>
    );
}
