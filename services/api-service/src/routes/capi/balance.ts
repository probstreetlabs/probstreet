import { Hono } from 'hono';
import { authorization } from '@/middlewares/authorization';
import { idempotency } from '@/middlewares/idempotency';
import { deposit, getBalance, getDepositAmount, withdraw } from '@/controllers/balance';

export const balanceRoutes = new Hono();

balanceRoutes.get('/', authorization, getBalance);
balanceRoutes.get('/deposit', authorization, getDepositAmount);
balanceRoutes.post('/deposit', authorization, idempotency, deposit);
balanceRoutes.post('/withdraw', authorization, idempotency, withdraw);
