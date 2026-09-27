import { Hono } from 'hono';
import { authorization } from '@/middlewares/authorization';
import { deposit, getBalance, getDepositAmount, withdraw } from '@/controllers/balance';

export const balanceRoutes = new Hono();

balanceRoutes.get('/', authorization, getBalance);
balanceRoutes.post('/deposit', authorization, deposit);
balanceRoutes.post('/withdraw', authorization, withdraw);
balanceRoutes.get('/deposit', authorization, getDepositAmount);
