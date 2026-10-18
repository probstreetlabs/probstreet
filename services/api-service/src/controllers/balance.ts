import { Context } from 'hono';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '@/libs/logger';
import { EVENTS } from '@/config/constants';
import { captureError } from '@/libs/sentry';
import { prisma } from '@probstreet/database';
import { pushToQueue } from '@/libs/redis/queue';
import { triggerCashfreePayout } from '@/libs/cashfree/payouts';
import { sendNotification } from '@/libs/notification/dispatcher';

export const getBalance = async (c: Context) => {
	try {
		const userId = c.get('user').id;

		if (!userId) {
			logger.warn(
				{
					context: 'GET_BALANCE_UNAUTHORIZED',
				},
				'Unauthorized access attempt to getBalance controller',
			);
			return c.json(
				{
					success: false,
					error: 'Unauthorized',
				},
				401,
			);
		}

		let response = await pushToQueue(EVENTS.GET_BALANCE, { userId });

		if (!response.success && response.message.includes('User not found')) {
			logger.warn({ userId }, 'User not found in engine, attempting to sync from DB');
			const dbUser = await prisma.user.findUnique({
				where: { id: userId },
				include: { wallet: true },
			});

			if (dbUser) {
				// Sync user to engine
				await pushToQueue(EVENTS.CREATE_USER, {
					id: dbUser.id,
					name: dbUser.username || '',
					phone: dbUser.phone,
					kycVerificationStatus: dbUser.kycVerificationStatus,
					paymentVerificationStatus: dbUser.paymentVerificationStatus,
				});

				// Sync balance to engine
				await pushToQueue(EVENTS.INIT_BALANCE, {
					userId: dbUser.id,
					amount: Number(dbUser.wallet?.balance || 0),
					locked: Number(dbUser.wallet?.locked || 0),
				});

				// Retry fetching balance
				response = await pushToQueue(EVENTS.GET_BALANCE, { userId });
			}
		}

		if (!response.success) {
			logger.error(
				{
					alert: true,
					userId,
					context: 'GET_BALANCE_ENGINE_FAIL',
				},
				'Failed to fetch balance from engine',
			);
			return c.json(
				{
					success: false,
					message: response.message,
				},
				500,
			);
		}

		logger.info({ userId, response }, 'Balance get from engine ');

		return c.json(
			{
				success: true,
				message: response.message,
				data: response.data,
			},
			200,
		);
	} catch (error) {
		captureError(error, {
			tags: {
				controller: 'balance',
				action: 'GET_BALANCE',
				userId: c.get('user')?.id,
			},
		});
		logger.error(
			{
				alert: true,
				context: 'GET_BALANCE_CONTROLLER_FAIL',
				error,
			},
			'Unhandled error in getBalance controller',
		);
		return c.json(
			{
				success: false,
				error: 'Internal server error',
			},
			500,
		);
	}
};

export const getDepositAmount = async (c: Context) => {
	try {
		const userId = (c.get('user') as any).id;

		if (!userId) {
			logger.warn(
				{
					context: 'GET_DEPOSIT_AMOUNT_UNAUTHORIZED',
				},
				'Unauthorized access attempt to getDepositAmount',
			);
			return c.json(
				{
					success: false,
					error: 'Unauthorized',
				},
				401,
			);
		}

		const user = await prisma.user.findUnique({
			where: {
				id: userId,
			},
		});

		if (!user) {
			logger.warn(
				{
					context: 'GET_DEPOSIT_AMOUNT_USER_NOT_FOUND',
					userId,
				},
				'User not found in database',
			);
			return c.json(
				{
					success: false,
					message: 'User not found',
				},
				404,
			);
		}

		const { _sum } = await prisma.transaction.aggregate({
			_sum: {
				amount: true,
			},
			where: {
				userId,
				type: 'DEPOSIT',
				status: 'SUCCESS',
			},
		});

		const total = _sum.amount || 0;

		return c.json(
			{
				success: true,
				data: {
					totalDepositAmount: total,
				},
			},
			200,
		);
	} catch (error) {
		captureError(error, {
			tags: {
				controller: 'balance',
				action: 'GET_DEPOSIT_AMOUNT',
				userId: (c.get('user') as any)?.id,
			},
		});
		logger.error(
			{
				alert: true,
				context: 'GET_DEPOSIT_AMOUNT_CONTROLLER_FAIL',
				error,
			},
			'Unhandled error in getDepositAmount controller',
		);
		return c.json(
			{
				success: false,
				error: 'Internal server error',
			},
			500,
		);
	}
};

export const withdraw = async (c: Context) => {
	try {
		const userId = (c.get('user') as any).id;

		if (!userId) {
			logger.warn(
				{
					context: 'WITHDRAW_UNAUTHORIZED',
				},
				'Unauthorized access attempt to withdraw',
			);
			return c.json(
				{
					success: false,
					error: 'Unauthorized',
				},
				401,
			);
		}

		const reqBody = await c.req.json<{
			amount: string;
			currentWalletAmount: string;
			paymentMethodId: string;
		}>();

		if (!reqBody.paymentMethodId) {
			return c.json({ success: false, message: 'Payment method is required' }, 400);
		}

		const user = await prisma.user.findUnique({ where: { id: userId } });

		if (!user) {
			return c.json({ success: false, message: 'User not found' }, 404);
		}

		if (user.kycVerificationStatus !== 'VERIFIED') {
			return c.json(
				{
					success: false,
					message: 'KYC must be verified to withdraw funds',
				},
				403,
			);
		}

		const amount = Number(reqBody.amount);
		const currentWalletAmount = Number(reqBody.currentWalletAmount);

		const calculatedFee = amount * 0.0025;
		const fee = Math.min(Math.max(calculatedFee, 5), 100);
		const totalDeduction = amount + fee;

		if (totalDeduction > currentWalletAmount) {
			return c.json(
				{
					success: false,
					message: 'Insufficient balance for withdrawal including fees',
				},
				400,
			);
		}

		const DAILY_WITHDRAWAL_LIMIT = 100000;
		const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

		const dailyWithdrawalTx = await prisma.transaction.aggregate({
			_sum: { amount: true },
			where: {
				userId,
				type: 'WITHDRAWAL',
				status: { in: ['SUCCESS', 'PENDING'] },
				createdAt: { gte: oneDayAgo },
			},
		});

		const currentDayWithdrawalTotal = Number(dailyWithdrawalTx._sum.amount || 0);

		if (currentDayWithdrawalTotal + amount > DAILY_WITHDRAWAL_LIMIT) {
			const remaining = Math.max(0, DAILY_WITHDRAWAL_LIMIT - currentDayWithdrawalTotal);
			return c.json(
				{
					success: false,
					message: `Daily withdrawal limit of ₹${DAILY_WITHDRAWAL_LIMIT.toLocaleString('en-IN')} reached. Remaining quota for 24h: ₹${remaining.toLocaleString('en-IN')}`,
				},
				400,
			);
		}

		const paymentMethod = await prisma.paymentMethod.findUnique({
			where: { id: reqBody.paymentMethodId, userId },
		});

		if (!paymentMethod || paymentMethod.status !== 'VERIFIED') {
			return c.json({ success: false, message: 'Invalid or unverified payment method' }, 400);
		}

		// Security: 24-hour cooling-off period on newly added or reviewed payout methods
		const methodEffectiveTime = new Date(
			paymentMethod.reviewedAt || paymentMethod.submittedAt,
		).getTime();
		const coolingOffMs = 24 * 60 * 60 * 1000;
		const elapsedSinceMethod = Date.now() - methodEffectiveTime;

		if (elapsedSinceMethod < coolingOffMs) {
			const hoursRemaining = Math.max(
				1,
				Math.ceil((coolingOffMs - elapsedSinceMethod) / (60 * 60 * 1000)),
			);
			return c.json(
				{
					success: false,
					message: `Security cooling-off period active: Newly registered payout methods cannot withdraw funds for 24 hours. Please retry in approximately ${hoursRemaining} hour(s).`,
				},
				400,
			);
		}

		const transferId = `w_${uuidv4().replace(/-/g, '')}`;

		try {
			await triggerCashfreePayout({
				transferId,
				amount: amount,
				paymentMethod: {
					type: paymentMethod.type === 'UPI' ? 'UPI' : 'BANK',
					upiNumber: paymentMethod.upiNumber,
					accountNumber: paymentMethod.accountNumber,
					ifscCode: paymentMethod.ifscCode,
				},
			});
		} catch (error: any) {
			captureError(error, {
				tags: {
					controller: 'balance',
					action: 'INITIATE_WITHDRAWAL',
					userId,
					provider: 'cashfree',
				},
				contexts: {
					transaction: {
						amount: typeof amount !== 'undefined' ? amount : undefined,
					},
				},
			});
			logger.error({ error, transferId }, 'Payout gateway failed in withdrawal');
			return c.json(
				{
					success: false,
					message:
						error.message || 'Payment gateway rejected the transfer. Please try again later.',
				},
				400,
			);
		}

		const response = await pushToQueue(EVENTS.WITHDRAW_BALANCE, {
			userId: userId,
			amount: totalDeduction,
		});

		if (!response.success) {
			return c.json(
				{
					success: false,
					message: response.message || 'Failed to deduct withdrawal from wallet',
					data: response.data,
				},
				400,
			);
		}

		if (response.success) {
			try {
				await prisma.$transaction(async (tx) => {
					await tx.wallet.update({
						where: { userId },
						data: { balance: { decrement: totalDeduction } },
					});

					await tx.transaction.create({
						data: {
							userId,
							amount,
							type: 'WITHDRAWAL',
							status: 'PENDING',
							remarks: `Payout transfer initiated [Transfer ID: ${transferId}]`,
						},
					});

					await tx.platformRevenue.create({
						data: {
							userId,
							amount: fee,
							type: 'WITHDRAWAL_FEE',
							remarks: `0.25% Withdrawal Fee (min 5, max 100) on ${amount}`,
						},
					});
				});
			} catch (error) {
				captureError(error, {
					tags: {
						controller: 'balance',
						action: 'WITHDRAW_TX_FAIL',
						userId,
					},
					contexts: {
						transaction: {
							amount: typeof totalDeduction !== 'undefined' ? totalDeduction : undefined,
						},
					},
				});
				logger.error(
					{
						alert: true,
						error,
						userId,
						amount: totalDeduction,
					},
					'Failed to update DB after withdrawal',
				);
				return c.json(
					{
						success: false,
						message: 'Withdrawal processed but failed to update DB, please contact support',
					},
					500,
				);
			}

			if (user.email) {
				sendNotification({
					type: 'withdrawal.success',
					data: {
						email: user.email,
						amount,
					},
				}).catch((err) => logger.error({ err, userId }, 'Failed to dispatch withdrawal.success'));
			}
		}

		return c.json(
			{
				success: true,
				message: response.message,
				data: response.data,
			},
			200,
		);
	} catch (error) {
		captureError(error, {
			tags: {
				controller: 'balance',
				action: 'WITHDRAW',
				userId: (c.get('user') as any)?.id,
			},
		});
		logger.error(
			{
				alert: true,
				context: 'WITHDRAW_CONTROLLER_FAIL',
				error,
			},
			'Unhandled error in withdraw controller',
		);
		return c.json(
			{
				success: false,
				message: 'Internal server error',
			},
			500,
		);
	}
};
