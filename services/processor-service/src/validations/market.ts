import { z } from 'zod';

export const UpdateTradersCountSchema = z.object({
	marketId: z.string().min(1),
});

export const UpdateStockPriceSchema = z.object({
	marketId: z.string().min(1),
	yesPrice: z.coerce.number(),
	noPrice: z.coerce.number(),
});

export const MarketResolvedSchema = z.object({
	marketId: z.string().min(1),
	result: z.enum(['YES', 'NO', 'CANCEL']),
});
