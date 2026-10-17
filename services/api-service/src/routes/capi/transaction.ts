import { Hono } from 'hono';
import { generalLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';
import { getTransactionHistory } from '@/controllers/transaction';

export const transactionRoutes = new Hono();

transactionRoutes.get('/', authorization, generalLimiter, getTransactionHistory);
