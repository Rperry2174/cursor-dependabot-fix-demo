import { CreateListingSchema, CreateOrderSchema, formatZodError, WarehouseIpSchema } from '../src/schemas';

describe('schemas (zod@3 APIs)', () => {
  it('accepts a valid listing and keeps passthrough keys', () => {
    const parsed = CreateListingSchema.parse({
      sku: 'AJ1-CHI-10',
      brand: 'Jordan',
      model: '1 Retro High',
      size: '10',
      condition: 'new',
      ask: { amountCents: 22000, currency: 'USD', note: 'heat' },
      warehouseIp: '192.168.1.10',
      sellerNote: 'DS',
    });
    expect(parsed.ask.amountCents).toBe(22000);
    expect((parsed as any).sellerNote).toBe('DS');
    expect((parsed.ask as any).note).toBe('heat');
  });

  it('formats zod errors with .format()', () => {
    const result = CreateListingSchema.safeParse({ sku: 1 });
    expect(result.success).toBe(false);
    if (result.success) return;
    const formatted = formatZodError(result.error);
    expect(formatted).toHaveProperty('_errors');
    expect(typeof formatted).toBe('object');
  });

  it('validates IPv4 via z.string().ip()', () => {
    expect(WarehouseIpSchema.parse('10.0.0.1')).toBe('10.0.0.1');
    expect(() => WarehouseIpSchema.parse('not-an-ip')).toThrow();
  });

  it('rejects bad order payloads with required_error paths', () => {
    const result = CreateOrderSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
