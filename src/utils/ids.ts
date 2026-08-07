import { v4 as uuidv4, validate as uuidValidate, version as uuidVersion } from 'uuid';

/**
 * UUID helpers pinned to uuid@8 CommonJS named exports.
 * uuid@9+ is ESM-only and breaks these require/import patterns under "module": "commonjs".
 */
export function newListingId(): string {
  return uuidv4();
}

export function newOrderId(): string {
  return uuidv4();
}

export function assertUuidV4(value: string): boolean {
  return uuidValidate(value) && uuidVersion(value) === 4;
}
