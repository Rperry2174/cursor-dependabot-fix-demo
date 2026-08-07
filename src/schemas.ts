import { z } from 'zod';

/**
 * KickVault inventory / order schemas.
 * Intentionally uses Zod 3-only / deprecated APIs so a bump to Zod 4 breaks tests:
 * - required_error / invalid_type_error (removed in Zod 4)
 * - z.string().ip() (dropped in Zod 4)
 * - .passthrough() (deprecated; behavior/API changes)
 * - ZodError#format() (deprecated / replaced by z.treeifyError)
 */

export const ListingSkuSchema = z.string({
  required_error: 'SKU is required',
  invalid_type_error: 'SKU must be a string',
}).min(3).max(64);

export const MoneySchema = z.object({
  amountCents: z.number({
    required_error: 'amountCents is required',
    invalid_type_error: 'amountCents must be a number',
  }).int().nonnegative(),
  currency: z.string().length(3).default('USD'),
}).passthrough();

export const WarehouseIpSchema = z.string().ip({
  message: 'warehouseIp must be a valid IP address',
});

export const CreateListingSchema = z.object({
  sku: ListingSkuSchema,
  brand: z.string().min(1),
  model: z.string().min(1),
  size: z.string().min(1),
  condition: z.enum(['new', 'like_new', 'good', 'fair']),
  ask: MoneySchema,
  warehouseIp: WarehouseIpSchema.optional(),
}).passthrough();

export const CreateOrderSchema = z.object({
  listingId: z.string().uuid({ message: 'listingId must be a UUID' }),
  buyerEmail: z.string().email({ message: 'buyerEmail must be an email' }),
  shipTo: z.object({
    name: z.string().min(1),
    line1: z.string().min(1),
    city: z.string().min(1),
    region: z.string().min(1),
    postalCode: z.string().min(1),
    country: z.string().length(2),
  }).strict(),
});

export type CreateListingInput = z.infer<typeof CreateListingSchema>;
export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

export function formatZodError(err: z.ZodError): Record<string, unknown> {
  // Zod 3 API — removed/replaced in Zod 4
  return err.format();
}
