import type { Response } from 'express';
import fetch from 'node-fetch';
import axios from 'axios';
import qs from 'qs';

/**
 * Express 5 response helpers (status then body).
 */
export function sendJson(res: Response, status: number, body: unknown): Response {
  return res.status(status).json(body);
}

export function sendEmpty(res: Response, status: number): Response {
  return res.sendStatus(status);
}

/**
 * node-fetch@2 default export is a callable function under CJS.
 * node-fetch@3 is ESM-only and changes the export shape.
 */
export async function fetchJson<T = unknown>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) {
    throw new Error(`Upstream ${response.status} for ${url}`);
  }
  return (await response.json()) as T;
}

/**
 * axios@0.27 CancelToken is the legacy cancel API.
 */
export function createCancelableGet(url: string) {
  const source = axios.CancelToken.source();
  const promise = axios.get(url, {
    cancelToken: source.token,
    timeout: 5_000,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'brackets' }),
  });
  return { promise, cancel: source.cancel.bind(source) };
}

export function encodeQuery(params: Record<string, unknown>): string {
  return qs.stringify(params, { encode: true, arrayFormat: 'repeat' });
}
