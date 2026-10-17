import { Hono } from 'hono';
import { requireScope } from '@/middlewares/scope';
import { idempotency } from '@/middlewares/idempotency';
import { authorization } from '@/middlewares/authorization';
import { generalLimiter, financialLimiter } from '@/middlewares/limiter';
import { deposit, getBalance, getDepositAmount, withdraw } from '@/controllers/balance';

export const balanceRoutes = new Hono();

balanceRoutes.get('/', authorization, requireScope('wallet:read'), generalLimiter, getBalance);
balanceRoutes.get(
	'/deposit',
	authorization,
	requireScope('wallet:read'),
	generalLimiter,
	getDepositAmount,
);
balanceRoutes.post('/deposit', authorization, financialLimiter, idempotency, deposit);
balanceRoutes.post('/withdraw', authorization, financialLimiter, idempotency, withdraw);
