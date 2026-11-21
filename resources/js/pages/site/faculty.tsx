import { Link } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { ArticleCard } from '@/components/site/article-card';
import { Gallery } from '@/components/site/gallery';
import { Notebook } from '@/components/site/notebook';
import { OrderPanel, checkoutUrl } from '@/components/site/order-panel';
import { CoverPreview } from '@/components/site/personalizer';
import { ReviewList } from '@/components/site/review-list';
import { SectionHeading } from '@/components/site/section-heading';
import { StickyOrderBar } from '@/components/site/sticky-order-bar';
import { useSite, useT } from '@/hooks/use-t';
import { track } from '@/lib/track';
import type {
    ArticleCard as Article,
    Design,
    Product,
    Review,
} from '@/types/site';

type Props = {
    page: { title: string; excerpt: string | null; body: string | null };
    design: Design;
    product: Product;
    designs: Design[];
    reviews: Review[];
    articles: Article[];
};

export default function FacultyPage({
    page,
    design,
    product,
    designs,
    reviews,
    articles,
}: Props) {
    const t = useT();
    const { site } = useSite();
    const [name, setName] = useState('');
    const [message, setMessage] = useState('');
    const others = designs.filter((item) => item.key !== design.key);

    useEffect(() => {
        track('view_item', {
            value: product.price / 100,
            design: design.key,
            items: [
                {
                    item_id: `gift-pack-${design.key}`,
                    item_name: product.name,
                    item_variant: design.name,
                    price: product.price / 100,
                    quantity: 1,
                },
            ],
        });
    }, [design.key, design.name, product.name, product.price]);

    return (
        <>
            <nav
                aria-label="Breadcrumb"
                className="wrap pt-6 text-sm text-ink-soft"
            >
                <ol className="flex flex-wrap gap-x-2">
                    <li>
                        <Link href={site.home} className="link-line">
                            {t('nav.home')}
                        </Link>
                        <span aria-hidden="true" className="ms-2">
                            /
                        </span>
                    </li>
                    <li>
                        <Link href={product.url} className="link-line">
                            {product.name}
                        </Link>
                        <span aria-hidden="true" className="ms-2">
                            /
                        </span>
                    </li>
                    <li aria-current="page">{design.name}</li>
                </ol>
            </nav>

            <div className="wrap grid gap-10 pt-8 pb-16 lg:grid-cols-12 lg:gap-8 lg:pt-12 lg:pb-28">
                <div className="lg:col-span-7">
                    <h1 className="display text-display-lg lg:text-display-xl">
                        {page.title}
                    </h1>
                    {page.excerpt && (
                        <p className="measure mt-6 text-lede text-ink-soft">
                            {page.excerpt}
                        </p>
                    )}
                    <CoverPreview
                        design={design}
                        name={name}
                        className="mt-10"
                    />
                    <div className="mt-4">
                        <Gallery images={design.images} />
                    </div>
                    {page.body && (
                        <div
                            className="prose-sattr mt-12"
                            dangerouslySetInnerHTML={{ __html: page.body }}
                        />
                    )}
                </div>

                <div className="lg:col-span-4 lg:col-start-9">
                    <div className="lg:sticky lg:top-8">
                        <OrderPanel
                            product={product}
                            designs={designs}
                            design={design}
                            onDesign={() => {}}
                            name={name}
                            onName={setName}
                            message={message}
                            onMessage={setMessage}
                            lockDesign
                            heading={
                                <div>
                                    <h2 className="display text-display-md">
                                        {t('faculty.product_name', {
                                            product: product.name,
                                            design: design.name,
                                        })}
                                    </h2>
                                    <p className="mt-2 text-ink-soft">
                                        {product.tagline}
                                    </p>
                                </div>
                            }
                        />
                        <ul className="mt-8 border-t border-stone text-[0.9375rem]">
                            {product.contents.map((item) => (
                                <li
                                    key={item.title}
                                    className="flex justify-between gap-6 border-b border-stone py-3"
                                >
                                    <span>{item.title}</span>
                                    <span className="text-end text-ink-soft">
                                        {item.detail}
                                    </span>
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-sm">
                            <Link href={product.url} className="link-line">
                                {t('faculty.about_pack')}
                            </Link>
                        </p>
                    </div>
                </div>
            </div>

            {reviews.length > 0 && (
                <section
                    aria-labelledby="reviews-title"
                    className="wrap py-16 md:py-24"
                >
                    <SectionHeading
                        id="reviews-title"
                        title={t('product.reviews_title')}
                    />
                    <ReviewList reviews={reviews} />
                </section>
            )}

            {articles.length > 0 && (
                <section
                    aria-labelledby="articles-title"
                    className="wrap py-16 md:py-24"
                >
                    <SectionHeading
                        id="articles-title"
                        title={t('faculty.articles_title')}
                    />
                    <div className="grid gap-12 md:grid-cols-3 md:gap-8">
                        {articles.map((article) => (
                            <ArticleCard key={article.url} article={article} />
                        ))}
                    </div>
                </section>
            )}

            <section
                aria-labelledby="others-title"
                className="wrap py-16 md:py-24"
            >
                <SectionHeading
                    id="others-title"
                    title={t('faculty.other_title')}
                />
                <ul className="grid grid-cols-3 gap-x-4 gap-y-10 md:grid-cols-7 md:gap-x-6">
                    {others.map((item) => (
                        <li key={item.key}>
                            <Link
                                href={item.url ?? product.url}
                                className="group block"
                            >
                                <div className="bg-paper-deep px-[18%] py-[12%]">
                                    <Notebook
                                        designKey={item.key}
                                        tint={item.tint}
                                        className="transition-transform duration-700 ease-quiet group-hover:-translate-y-1"
                                    />
                                </div>
                                <span className="link-line mt-3 inline-block text-[0.9375rem]">
                                    {item.name}
                                </span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <StickyOrderBar
                product={product}
                href={checkoutUrl(
                    product.checkout_url,
                    design.key,
                    name,
                    message,
                )}
                soldOut={design.sold_out}
            />
        </>
    );
}
