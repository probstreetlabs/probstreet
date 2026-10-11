import { api } from '@/lib/axios';

export const placeOrder = (
	side: string,
	symbol: string,
	action: string,
	price: number,
	orderType: string,
	quantity: number,
	marketId: string,
	idempotencyKey?: string,
) => {
	const endpoint = action.toLowerCase() === 'sell' ? '/order/sell' : '/order/buy';
	return api.post(
		endpoint,
		{ side, symbol, action, price, orderType, quantity, marketId },
		idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : undefined,
	);
};

export const cancelOrder = (orderId: string, marketId: string) => {
	return api.post('/order/cancel', { orderId, marketId });
};
