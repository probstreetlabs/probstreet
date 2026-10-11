import { Hono } from 'hono';
import { buy, sell, cancel } from '@/controllers/order';
import { idempotency } from '@/middlewares/idempotency';
import { authorization } from '@/middlewares/authorization';

export const orderRoutes = new Hono();

orderRoutes.post('/buy', authorization, idempotency, buy);
orderRoutes.post('/sell', authorization, idempotency, sell);
orderRoutes.post('/cancel', authorization, cancel);
