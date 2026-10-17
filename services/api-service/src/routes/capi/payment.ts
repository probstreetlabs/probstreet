import { Hono } from 'hono';
import { financialLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';
import { initPayment, paymentWebhook, payoutWebhook, paymentVerify } from '@/controllers/payment';

export const paymentRoutes = new Hono();

paymentRoutes.post('/webhook', paymentWebhook);
paymentRoutes.post('/payout-webhook', payoutWebhook);
paymentRoutes.post('/init', authorization, financialLimiter, initPayment);
paymentRoutes.get('/verify/:orderId', authorization, financialLimiter, paymentVerify);
