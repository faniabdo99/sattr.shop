import { Link } from '@inertiajs/react';
import { Flag } from 'lucide-react';
import { StatusBadge } from '@/components/admin/status-badge';
import { rowClass, Table, Td, Th } from '@/components/admin/table';
import { cn } from '@/lib/utils';
import type { OrderRow } from '@/types/admin';

type Selection = {
    ids: number[];
    onChange: (ids: number[]) => void;
};

type Props = {
    orders: OrderRow[];
    caption: string;
    selection?: Selection;
};

export function OrdersTable({ orders, caption, selection }: Props) {
    const selected = new Set(selection?.ids ?? []);
    const allSelected =
        orders.length > 0 && orders.every((order) => selected.has(order.id));

    const toggle = (id: number, checked: boolean) => {
        if (!selection) {
            return;
        }

        selection.onChange(
            checked
                ? [...selection.ids, id]
                : selection.ids.filter((current) => current !== id),
        );
    };

    return (
        <Table caption={caption}>
            <thead>
                <tr>
                    {selection && (
                        <Th className="w-8">
                            <input
                                type="checkbox"
                                aria-label="Select all orders on this page"
                                checked={allSelected}
                                onChange={(event) =>
                                    selection.onChange(
                                        event.target.checked
                                            ? orders.map((order) => order.id)
                                            : [],
                                    )
                                }
                                className="size-4 align-middle accent-line"
                            />
                        </Th>
                    )}
                    <Th>Order</Th>
                    <Th>Placed</Th>
                    <Th>Customer</Th>
                    <Th>Design</Th>
                    <Th numeric>Qty</Th>
                    <Th>Status</Th>
                    <Th>Payment</Th>
                    <Th numeric>Total</Th>
                    <Th>Source</Th>
                </tr>
            </thead>
            <tbody>
                {orders.map((order) => (
                    <tr
                        key={order.id}
                        className={cn(
                            rowClass,
                            'hover:bg-paper/50',
                            order.flagged && 'bg-danger/5 hover:bg-danger/10',
                        )}
                    >
                        {selection && (
                            <Td>
                                <input
                                    type="checkbox"
                                    aria-label={`Select order ${order.code}`}
                                    checked={selected.has(order.id)}
                                    onChange={(event) =>
                                        toggle(order.id, event.target.checked)
                                    }
                                    className="size-4 align-middle accent-line"
                                />
                            </Td>
                        )}
                        <th
                            scope="row"
                            className="px-3 py-2.5 text-left font-medium whitespace-nowrap"
                        >
                            <Link
                                href={order.url}
                                className="inline-flex items-center gap-1.5 text-line underline-offset-4 hover:underline"
                            >
                                {order.flagged && (
                                    <Flag
                                        className="size-3.5 fill-danger text-danger"
                                        aria-label="Flagged: unpaid InstaPay"
                                    />
                                )}
                                <span className="tabular-nums">
                                    {order.code}
                                </span>
                            </Link>
                        </th>
                        <Td className="whitespace-nowrap text-muted-foreground tabular-nums">
                            {order.created_at}
                        </Td>
                        <Td>
                            <span dir="auto" className="block">
                                {order.customer_name}
                            </span>
                            <span className="block text-xs text-muted-foreground tabular-nums">
                                {order.phone} · {order.governorate}
                            </span>
                        </Td>
                        <Td>{order.design ?? '—'}</Td>
                        <Td numeric>{order.quantity ?? '—'}</Td>
                        <Td>
                            <StatusBadge
                                value={order.status}
                                label={order.status_label}
                            />
                        </Td>
                        <Td>
                            <span className="flex flex-wrap items-center gap-1.5">
                                <span className="text-xs text-muted-foreground">
                                    {order.payment_method_label}
                                </span>
                                <StatusBadge
                                    value={order.payment_status}
                                    label={order.payment_status_label}
                                />
                            </span>
                        </Td>
                        <Td numeric className="whitespace-nowrap">
                            {order.total_label}
                        </Td>
                        <Td className="text-muted-foreground">
                            {order.source ?? '—'}
                        </Td>
                    </tr>
                ))}
            </tbody>
        </Table>
    );
}
