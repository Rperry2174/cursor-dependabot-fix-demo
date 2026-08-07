import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createListing, getListing, listActive, delist, askStats } from './inventory';
import { createOrder, getOrder, cancelOrder } from './orders';
import { sendJson, sendEmpty } from './utils/http';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    sendJson(res, 200, { ok: true, service: 'kickvault-inventory' });
  });

  app.get('/listings', (_req, res) => {
    sendJson(res, 200, { listings: listActive(), stats: askStats() });
  });

  app.post('/listings', (req, res) => {
    const result = createListing(req.body);
    if (!result.ok) {
      return sendJson(res, 400, { error: result.error });
    }
    return sendJson(res, 201, { listing: result.listing });
  });

  app.get('/listings/:id', (req, res) => {
    const id = req.params.id;
    const listing = getListing(id);
    if (!listing) {
      return sendEmpty(res, 404);
    }
    return sendJson(res, 200, { listing });
  });

  app.delete('/listings/:id', (req, res) => {
    const id = req.params.id;
    const listing = delist(id);
    if (!listing) {
      return sendEmpty(res, 404);
    }
    return sendJson(res, 200, { listing });
  });

  app.post('/orders', (req, res) => {
    const result = createOrder(req.body);
    if (!result.ok) {
      const status = result.error === 'listing_unavailable' ? 409 : 400;
      return sendJson(res, status, { error: result.error });
    }
    return sendJson(res, 201, { order: result.order });
  });

  app.get('/orders/:id', (req, res) => {
    const id = req.params.id;
    const order = getOrder(id);
    if (!order) {
      return sendEmpty(res, 404);
    }
    return sendJson(res, 200, { order });
  });

  app.delete('/orders/:id', (req, res) => {
    const id = req.params.id;
    const order = cancelOrder(id);
    if (!order) {
      return sendEmpty(res, 404);
    }
    return sendJson(res, 200, { order });
  });

  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    sendJson(res, 500, { error: err.message || 'internal_error' });
  });

  return app;
}
