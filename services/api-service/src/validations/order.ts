import { z } from 'zod';

export const orderSchema = z
	.object({
		side: z
			.string()
			.trim()
			.toUpperCase()
			.refine((val) => val === 'YES' || val === 'NO', {
				message: "Side must be 'YES' or 'NO'",
			}),
		symbol: z.string().trim().min(1, { message: 'Stock symbol is required' }),
		price: z.coerce.number().min(0, { message: 'Price cannot be negative' }),
		orderType: z
			.string()
			.trim()
			.toUpperCase()
			.refine((val) => val === 'LIMIT' || val === 'MARKET', {
				message: "Order type must be 'LIMIT' or 'MARKET'",
			}),
		quantity: z.coerce
			.number()
			.int({ message: 'Quantity must be a whole number' })
			.positive({ message: 'Quantity must be greater than 0' }),
		marketId: z.string().trim().min(1, { message: 'Market ID is required' }),
		idempotencyKey: z.string().optional(),
	})
	.superRefine((data, ctx) => {
		if (data.orderType === 'LIMIT') {
			if (data.price < 0.5 || data.price > 9.5) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: 'Limit price must be between ₹0.5 and ₹9.5',
					path: ['price'],
				});
			}
		}
	});

export const cancelOrderSchema = z.object({
	orderId: z.string().trim().min(1, { message: 'Order ID is required' }),
	marketId: z.string().trim().min(1, { message: 'Market ID is required' }),
});

export type OrderInput = z.infer<typeof orderSchema>;
export type CancelOrderInput = z.infer<typeof cancelOrderSchema>;
