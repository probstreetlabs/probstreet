import { Hono } from 'hono';
import { requireScope } from '@/middlewares/scope';
import { idempotency } from '@/middlewares/idempotency';
import { authorization } from '@/middlewares/authorization';
import { deposit, getBalance, getDepositAmount, withdraw } from '@/controllers/balance';

export const balanceRoutes = new Hono();

balanceRoutes.get('/', authorization, requireScope('wallet:read'), getBalance);
balanceRoutes.get('/deposit', authorization, requireScope('wallet:read'), getDepositAmount);
balanceRoutes.post('/deposit', authorization, idempotency, deposit);
balanceRoutes.post('/withdraw', authorization, idempotency, withdraw);
