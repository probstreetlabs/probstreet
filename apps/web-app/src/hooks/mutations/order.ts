import { placeOrder } from '@/api/order';
import { useMutation } from '@tanstack/react-query';

export const usePlaceOrderMutation = () => {
	return useMutation({
		mutationKey: ['order'],
		mutationFn: ({
			side,
			symbol,
			action,
			price,
			orderType,
			quantity,
			marketId,
			idempotencyKey,
		}: {
			side: string;
			symbol: string;
			action: string;
			price: number;
			orderType: string;
			quantity: number;
			marketId: string;
			idempotencyKey?: string;
		}) => placeOrder(side, symbol, action, price, orderType, quantity, marketId, idempotencyKey),
	});
};
