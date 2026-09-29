import { Market } from '@probstreet/database';
import { prisma } from '@probstreet/database';

const REQUIRED_CONFIRMATIONS = 2;
const CONFIRMATION_WINDOW_MS = 30_000;

export async function checkWickConfirmation(
	market: Market,
	currentPrice: number,
	targetValue: number,
	condition: string,
): Promise<{ confirmed: boolean; count: number }> {
	const isHit = isConditionMet(currentPrice, targetValue, condition);

	if (!isHit) {
		if (market.wickConfirmCount > 0) {
			await prisma.market.update({
				where: { id: market.id },
				data: { wickConfirmCount: 0, wickFirstSeenAt: null },
			});
		}
		return { confirmed: false, count: 0 };
	}

	const newCount = market.wickConfirmCount + 1;
	const firstSeen = market.wickFirstSeenAt || new Date();

	await prisma.market.update({
		where: { id: market.id },
		data: { wickConfirmCount: newCount, wickFirstSeenAt: firstSeen },
	});

	const elapsed = Date.now() - firstSeen.getTime();
	if (newCount >= REQUIRED_CONFIRMATIONS && elapsed <= CONFIRMATION_WINDOW_MS) {
		return { confirmed: true, count: newCount };
	}

	return { confirmed: false, count: newCount };
}

function isConditionMet(price: number, target: number, condition: string): boolean {
	switch (condition) {
		case 'gte':
		case 'gt':
			return price >= target;
		case 'lte':
		case 'lt':
			return price <= target;
		case 'eq':
			return Math.abs(price - target) < 0.01;
		default:
			return price >= target;
	}
}
