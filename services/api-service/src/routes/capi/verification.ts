import { Hono } from 'hono';
import { rateLimiter, generalLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';
import {
	getVerificationDetails,
	getVerificationStatus,
	submitKyc,
	submitPaymentMethods,
	deletePaymentMethod,
} from '@/controllers/verification';

export const verificationRoutes = new Hono();

// KYC submission: 10 submissions per 5 minutes per user with 10-minute cooldown on abuse
const kycSubmitLimiter = rateLimiter({
	keyPrefix: 'rl:ver:kyc',
	userTier: { points: 10, duration: 300, blockDuration: 600 },
	ipTier: { points: 5, duration: 300, blockDuration: 600 },
});

// Payment method operations: 15-20 per 5 minutes
const paymentMethodSubmitLimiter = rateLimiter({
	keyPrefix: 'rl:ver:pm-sub',
	userTier: { points: 15, duration: 300 },
	ipTier: { points: 5, duration: 300 },
});

const paymentMethodDeleteLimiter = rateLimiter({
	keyPrefix: 'rl:ver:pm-del',
	userTier: { points: 20, duration: 300 },
	ipTier: { points: 10, duration: 300 },
});

verificationRoutes.get('/', authorization, generalLimiter, getVerificationDetails);
verificationRoutes.get('/status', authorization, generalLimiter, getVerificationStatus);

// kyc and payment method submit routes
verificationRoutes.post('/kyc/submit', authorization, kycSubmitLimiter, submitKyc);
verificationRoutes.post(
	'/payment-method/submit',
	authorization,
	paymentMethodSubmitLimiter,
	submitPaymentMethods,
);
verificationRoutes.delete(
	'/payment-method/:id',
	authorization,
	paymentMethodDeleteLimiter,
	deletePaymentMethod,
);
