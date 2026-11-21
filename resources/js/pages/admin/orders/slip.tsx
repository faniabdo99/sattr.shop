import { Head } from '@inertiajs/react';
import { Printer } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
    order: {
        code: string;
        date: string | null;
        customer_name: string;
        phone: string;
        alt_phone: string | null;
        address: string;
        city: string | null;
        governorate: string;
        notes: string | null;
        design: string;
        quantity: number | null;
        cover_name: string | null;
        gift_message: string | null;
        payment_method: string;
        payment_status: string;
        cod_amount: number;
        cod_label: string;
        tracking: string | null;
    };
};

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[22mm_1fr] gap-[2mm]">
            <dt className="text-[7.5pt] tracking-wide text-neutral-600 uppercase">
                {label}
            </dt>
            <dd className="min-w-0 break-words">{children}</dd>
        </div>
    );
}

/**
 * A6 packing slip. Rendered without the admin layout; sizes are in mm/pt so
 * the sheet prints at its real size (`@page { size: A6 }` lives in app.css).
 */
export default function OrderSlip({ order }: Props) {
    const collect = order.cod_amount > 0;

    return (
        <div className="min-h-screen bg-neutral-200 py-6 text-black print:min-h-0 print:bg-white print:py-0">
            <Head title={`Packing slip ${order.code}`} />

            <div className="mx-auto mb-4 flex w-[105mm] items-center justify-between print:hidden">
                <p className="text-xs text-neutral-600">
                    A6 · 105 × 148 mm. Print at 100% scale.
                </p>
                <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-9 items-center gap-2 rounded-md bg-ink px-4 text-sm font-medium text-paper hover:bg-ink/90"
                >
                    <Printer className="size-4" aria-hidden />
                    Print
                </button>
            </div>

            <article
                dir="ltr"
                className="mx-auto box-border flex min-h-[148mm] w-[105mm] flex-col gap-[3mm] bg-white p-[6mm] text-[9pt] leading-snug print:min-h-0 print:w-auto print:p-0"
            >
                <header className="flex items-end justify-between gap-[3mm] border-b-[0.4mm] border-black pb-[2mm]">
                    <div>
                        <p className="text-[7.5pt] tracking-wide text-neutral-600 uppercase">
                            Sattr · Order
                        </p>
                        <h1 className="text-[20pt] leading-none font-bold tabular-nums">
                            {order.code}
                        </h1>
                    </div>
                    <p className="text-[8pt] tabular-nums">{order.date}</p>
                </header>

                <section aria-label="Contents">
                    <dl className="grid gap-[1mm]">
                        <Row label="Design">
                            <span dir="auto" className="font-semibold">
                                {order.design}
                            </span>
                        </Row>
                        <Row label="Quantity">
                            <span className="font-semibold tabular-nums">
                                {order.quantity ?? '—'}
                            </span>
                        </Row>
                        <Row label="Cover name">
                            <span
                                dir="auto"
                                className="text-[11pt] font-semibold"
                            >
                                {order.cover_name || '—'}
                            </span>
                        </Row>
                        {order.gift_message && (
                            <Row label="Gift message">
                                <span
                                    dir="auto"
                                    className="whitespace-pre-line"
                                >
                                    {order.gift_message}
                                </span>
                            </Row>
                        )}
                    </dl>
                </section>

                <section
                    aria-label="Deliver to"
                    className="border-t-[0.2mm] border-black pt-[2mm]"
                >
                    <dl className="grid gap-[1mm]">
                        <Row label="Deliver to">
                            <span
                                dir="auto"
                                className="text-[11pt] font-semibold"
                            >
                                {order.customer_name}
                            </span>
                        </Row>
                        <Row label="Phone">
                            <span className="font-semibold tabular-nums">
                                {order.phone}
                                {order.alt_phone && ` / ${order.alt_phone}`}
                            </span>
                        </Row>
                        <Row label="Address">
                            <span dir="auto" className="block">
                                {order.address}
                            </span>
                            <span dir="auto" className="block font-semibold">
                                {[order.city, order.governorate]
                                    .filter(Boolean)
                                    .join('، ')}
                            </span>
                        </Row>
                        {order.notes && (
                            <Row label="Delivery notes">
                                <span
                                    dir="auto"
                                    className="whitespace-pre-line"
                                >
                                    {order.notes}
                                </span>
                            </Row>
                        )}
                    </dl>
                </section>

                <section
                    aria-label="Payment"
                    className="mt-auto border-t-[0.2mm] border-black pt-[2mm]"
                >
                    <dl className="grid gap-[1mm]">
                        <Row label="Payment">
                            {order.payment_method} · {order.payment_status}
                        </Row>
                        {order.tracking && (
                            <Row label="Bosta tracking">
                                <span className="font-semibold tabular-nums">
                                    {order.tracking}
                                </span>
                            </Row>
                        )}
                    </dl>
                    <div className="mt-[2mm] border-[0.5mm] border-black px-[3mm] py-[2mm] text-center">
                        {collect ? (
                            <>
                                <p className="text-[7.5pt] tracking-wide uppercase">
                                    COD amount to collect
                                </p>
                                <p className="text-[18pt] leading-tight font-bold tabular-nums">
                                    {order.cod_label}
                                </p>
                            </>
                        ) : (
                            <>
                                <p className="text-[12pt] font-bold">
                                    Collect nothing on delivery
                                </p>
                                <p className="text-[8pt]">
                                    {order.payment_method} ·{' '}
                                    {order.payment_status}
                                </p>
                            </>
                        )}
                    </div>
                </section>
            </article>
        </div>
    );
}
