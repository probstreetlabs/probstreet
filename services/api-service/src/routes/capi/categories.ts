import { Context, Hono } from 'hono';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';
import { prisma } from '@probstreet/database';
import { generalLimiter } from '@/middlewares/limiter';

export const categoriesRoutes = new Hono();

categoriesRoutes.get('/', generalLimiter, async (c: Context) => {
	try {
		const categories = await prisma.category.findMany({
			select: {
				id: true,
				categoryName: true,
			},
		});

		return c.json(
			{
				success: true,
				message: 'Fetched categories successfully',
				data: categories,
			},
			200,
		);
	} catch (error) {
		captureError(error, { tags: { controller: 'categories', action: 'GET_CATEGORIES' } });
		logger.error(
			{
				alert: true,
				context: 'CATEGORIES_ROUTE_FAIL',
				error,
			},
			'Unhandled error in categoriesRoutes',
		);
		return c.json(
			{
				success: false,
				error: 'Internal server error',
			},
			500,
		);
	}
});
