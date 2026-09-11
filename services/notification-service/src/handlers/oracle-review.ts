import { ENV_CONFIG } from '@/config/env';
import { notifyWebSockets } from '@/libs/ws';
import { logger } from '@/libs/logger/logger';
import { sendEmail } from '@/libs/agentmail/client';
import { sendFirebasePush } from '@/libs/firebase/push';

export async function handleOracleReview(env: ENV_CONFIG, prisma: any, data: any): Promise<void> {
	const { marketId, marketTitle, score, verdict } = data;

	if (!marketId || !marketTitle) throw new Error('Missing marketId or title for oracle.review');

	const admins = await prisma.user.findMany({
		where: { role: 'ADMIN' },
		select: { id: true, email: true, fcmToken: true },
	});

	if (admins.length === 0) {
		logger.warn('[oracle.review] No admins found to notify');
		return;
	}

	const { oracleReviewEmailHtml } = await import('@/libs/agentmail/templates/oracle');
	const subject = `[Action Required] AI Oracle Review: ${marketTitle}`;
	const reviewUrl = `${env.FRONTEND_URL}/dashboard/oracle/review`;
	const html = oracleReviewEmailHtml(marketTitle, verdict, score, reviewUrl);

	const emailAdmins = admins.filter((a: any) => a.email);

	if (emailAdmins.length > 0) {
		await Promise.allSettled(emailAdmins.map((a: any) => sendEmail(env, a.email, subject, html)));
	}

	const notificationData = {
		type: 'SYSTEM',
		title: 'Oracle Review Required',
		message: `Market "${marketTitle}" requires manual resolution confirmation (Score: ${score}).`,
		link: `/dashboard/oracle/review`,
		metadata: { marketId },
	};

	await prisma.notification.createMany({
		data: admins.map((a: any) => ({
			userId: a.id,
			...notificationData,
		})),
	});

	const pushAdmins = admins.filter((a: any) => a.fcmToken);
	if (pushAdmins.length > 0) {
		await Promise.allSettled(
			pushAdmins.map((a: any) =>
				sendFirebasePush(env, a.fcmToken, notificationData.title, notificationData.message, {
					marketId,
					type: 'SYSTEM',
				}),
			),
		);
	}

	await Promise.allSettled(
		admins.map((a: any) =>
			notifyWebSockets(env, a.id, {
				...notificationData,
				userId: a.id,
				createdAt: new Date(),
				isRead: false,
			}),
		),
	);

	logger.info(`[oracle.review] Notified ${admins.length} admins about market ${marketId}`);
}
