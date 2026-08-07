import { CreateOrderInput, CreateOrderSchema, formatZodError } from './schemas';
import { getListing, markSold } from './inventory';
import { newOrderId, assertUuidV4 } from './utils/ids';
import { formatOrderTimestamp } from './utils/catalog';
import { encodeQuery } from './utils/http';
import { success, warn } from './utils/logging';

export type Order = CreateOrderInput & {
  id: string;
  status: 'created' | 'cancelled';
  totalCents: number;
  currency: string;
  createdAt: string;
  receiptQuery: string;
};

const orders = new Map<string, Order>();

export function resetOrders(): void {
  orders.clear();
}

export function createOrder(input: unknown): { ok: true; order: Order } | { ok: false; error: Record<string, unknown> | string } {
  const parsed = CreateOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const listing = getListing(parsed.data.listingId);
  if (!listing || listing.status !== 'active') {
    warn(`order rejected — listing ${parsed.data.listingId} unavailable`);
    return { ok: false, error: 'listing_unavailable' };
  }

  const id = newOrderId();
  if (!assertUuidV4(id)) {
    throw new Error('uuid generator produced non-v4 id');
  }

  const order: Order = {
    ...parsed.data,
    id,
    status: 'created',
    totalCents: listing.ask.amountCents,
    currency: listing.ask.currency,
    createdAt: formatOrderTimestamp(),
    receiptQuery: encodeQuery({
      orderId: id,
      sku: listing.sku,
      total: listing.ask.amountCents,
    }),
  };

  markSold(listing.id);
  orders.set(id, order);
  success(`order ${id} created for ${listing.sku}`);
  return { ok: true, order };
}

export function getOrder(id: string): Order | undefined {
  return orders.get(id);
}

export function cancelOrder(id: string): Order | undefined {
  const order = orders.get(id);
  if (!order) return undefined;
  order.status = 'cancelled';
  orders.set(id, order);
  return order;
}
