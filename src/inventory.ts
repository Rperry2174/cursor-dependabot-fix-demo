import { CreateListingInput, CreateListingSchema, formatZodError } from './schemas';
import { newListingId, assertUuidV4 } from './utils/ids';
import { formatOrderTimestamp, summarizeAsks, daysSinceListed } from './utils/catalog';
import { info } from './utils/logging';

export type Listing = CreateListingInput & {
  id: string;
  status: 'active' | 'sold' | 'delisted';
  createdAt: string;
};

const listings = new Map<string, Listing>();

export function resetInventory(): void {
  listings.clear();
}

export function createListing(input: unknown): { ok: true; listing: Listing } | { ok: false; error: Record<string, unknown> } {
  const parsed = CreateListingSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: formatZodError(parsed.error) };
  }

  const id = newListingId();
  if (!assertUuidV4(id)) {
    throw new Error('uuid generator produced non-v4 id');
  }

  const listing: Listing = {
    ...parsed.data,
    id,
    status: 'active',
    createdAt: formatOrderTimestamp(),
  };
  listings.set(id, listing);
  info(`listed ${listing.sku} @ ${listing.ask.amountCents}¢`);
  return { ok: true, listing };
}

export function getListing(id: string): Listing | undefined {
  return listings.get(id);
}

export function listActive(): Listing[] {
  return Array.from(listings.values()).filter((l) => l.status === 'active');
}

export function delist(id: string): Listing | undefined {
  const listing = listings.get(id);
  if (!listing) return undefined;
  listing.status = 'delisted';
  listings.set(id, listing);
  return listing;
}

export function markSold(id: string): Listing | undefined {
  const listing = listings.get(id);
  if (!listing) return undefined;
  listing.status = 'sold';
  listings.set(id, listing);
  return listing;
}

export function askStats() {
  const asks = listActive().map((l) => l.ask.amountCents);
  return summarizeAsks(asks);
}

export function listingAgeDays(id: string): number | undefined {
  const listing = listings.get(id);
  if (!listing) return undefined;
  return daysSinceListed(listing.createdAt);
}
