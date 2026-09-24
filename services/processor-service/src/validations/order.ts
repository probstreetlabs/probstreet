import { z } from 'zod';

export const TradeExecutionSchema = z.object({
	marketId: z.string().min(1),
	makerId: z.string().min(1),
	takerId: z.string().min(1),
	makerOrderId: z.string().min(1),
	takerOrderId: z.string().min(1),
	stockType: z.enum(['YES', 'NO']),
	takerAction: z.enum(['BUY', 'SELL']),
	price: z.coerce.number().positive(),
	quantity: z.coerce.number().positive(),
	matchType: z.enum(['STANDARD', 'MINT', 'MERGE']),
});

export const OrderPlacedSchema = z.object({
	userId: z.string().min(1),
	marketId: z.string().min(1),
	side: z.enum(['YES', 'NO']),
	action: z.enum(['BUY', 'SELL']),
	price: z.coerce.number().positive(),
	originalQuantity: z.coerce.number().positive(),
});

export const OrderCancelledSchema = z.object({
	userId: z.string().min(1),
	orderId: z.string().nullish(),
	refund: z.coerce.number().nonnegative(),
	type: z.enum(['INR', 'YES_STOCK', 'NO_STOCK']),
	marketId: z.string().nullish(),
});

export const SharesSplitSchema = z.object({
	userId: z.string().min(1),
	marketId: z.string().min(1),
	quantity: z.coerce.number().positive(),
	cost: z.coerce.number().positive(),
});

export const SharesMergedSchema = z.object({
	userId: z.string().min(1),
	marketId: z.string().min(1),
	quantity: z.coerce.number().positive(),
	refund: z.coerce.number().nonnegative(),
});
