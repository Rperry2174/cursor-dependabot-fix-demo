import { createListing, getListing, listActive, delist, askStats, resetInventory, markSold } from '../src/inventory';
import { createOrder, resetOrders } from '../src/orders';
import { createApp } from '../src/app';
import { sendJson, sendEmpty } from '../src/utils/http';

describe('inventory + orders', () => {
  beforeEach(() => {
    resetInventory();
    resetOrders();
  });

  it('creates listings and computes ask stats', () => {
    const b = createListing({
      sku: 'DUNK-LOW-9',
      brand: 'Nike',
      model: 'Dunk Low',
      size: '9',
      condition: 'new',
      ask: { amountCents: 15000, currency: 'USD' },
    });
    const c = createListing({
      sku: 'YEEZY-350-11',
      brand: 'Adidas',
      model: 'Yeezy 350',
      size: '11',
      condition: 'like_new',
      ask: { amountCents: 25000, currency: 'USD' },
      warehouseIp: '127.0.0.1',
    });
    expect(b.ok).toBe(true);
    expect(c.ok).toBe(true);
    if (!b.ok || !c.ok) return;
    expect(listActive()).toHaveLength(2);
    expect(askStats()).toMatchObject({ count: 2, min: 15000, max: 25000 });
    expect(getListing(b.listing.id)?.sku).toBe('DUNK-LOW-9');
  });

  it('creates an order against an active listing', () => {
    const listed = createListing({
      sku: 'AJ4-MILITARY-10',
      brand: 'Jordan',
      model: '4 Retro',
      size: '10',
      condition: 'new',
      ask: { amountCents: 30000, currency: 'USD' },
    });
    expect(listed.ok).toBe(true);
    if (!listed.ok) return;

    const order = createOrder({
      listingId: listed.listing.id,
      buyerEmail: 'buyer@example.com',
      shipTo: {
        name: 'Sam Buyer',
        line1: '1 Market St',
        city: 'Austin',
        region: 'TX',
        postalCode: '78701',
        country: 'US',
      },
    });
    expect(order.ok).toBe(true);
    if (!order.ok) return;
    expect(order.order.totalCents).toBe(30000);
    expect(getListing(listed.listing.id)?.status).toBe('sold');
  });

  it('delists listings', () => {
    const listed = createListing({
      sku: 'NB-550-8',
      brand: 'New Balance',
      model: '550',
      size: '8',
      condition: 'good',
      ask: { amountCents: 12000, currency: 'USD' },
    });
    if (!listed.ok) throw new Error('setup failed');
    const d = delist(listed.listing.id);
    expect(d?.status).toBe('delisted');
    expect(listActive()).toHaveLength(0);
  });
});

describe('express@4 response helpers', () => {
  it('exposes app.del and uses res.json(status, body) signature', () => {
    const app = createApp();
    // Express 4 registers delete via app.del
    expect(typeof (app as any).del).toBe('function');

    const calls: any[] = [];
    const res: any = {
      json(...args: any[]) {
        calls.push(['json', ...args]);
        return res;
      },
      send(...args: any[]) {
        calls.push(['send', ...args]);
        return res;
      },
    };
    sendJson(res, 201, { ok: true });
    sendEmpty(res, 404);
    expect(calls[0]).toEqual(['json', 201, { ok: true }]);
    expect(calls[1]).toEqual(['send', 404]);
  });
});
