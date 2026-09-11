import { ENV_CONFIG } from '@/config/env';
import { notifyWebSockets } from '@/libs/ws';
import { logger } from '@/libs/logger/logger';
import { sendEmail } from '@/libs/agentmail/client';
import { sendFirebasePush } from '@/libs/firebase/push';

export async function handleOracleResolved(env: ENV_CONFIG, prisma: any, data: any): Promise<void> {
	const { marketId, marketTitle, symbol, verdict, score, source, reasoning } = data;

	if (!marketId || !marketTitle) {
		throw new Error('Missing marketId or title for oracle.resolved');
	}

	const admins = await prisma.user.findMany({
		where: { role: 'ADMIN' },
		select: { id: true, email: true, fcmToken: true },
	});

	if (admins.length === 0) {
		logger.warn('[oracle.resolved] No admins found to notify');
		return;
	}

	const sourceLabel =
		source === 'deterministic'
			? 'Deterministic Engine (Instant API Math)'
			: 'AI Evaluator (Groq 120B)';

	const { oracleResolvedEmailHtml } = await import('@/libs/agentmail/templates/oracle');
	const subject = `[Auto-Resolved] Oracle Resolution: ${marketTitle} -> ${verdict}`;
	const marketUrl = `${env.FRONTEND_URL}/market/${symbol || marketId}`;
	const html = oracleResolvedEmailHtml(
		marketTitle,
		verdict,
		sourceLabel,
		score,
		reasoning,
		marketUrl,
	);

	const emailAdmins = admins.filter((a: any) => a.email);
	if (emailAdmins.length > 0) {
		await Promise.allSettled(emailAdmins.map((a: any) => sendEmail(env, a.email, subject, html)));
	}

	const notificationData = {
		type: 'SYSTEM',
		title: `Oracle Auto-Resolved: ${verdict}`,
		message: `"${marketTitle}" was automatically resolved to ${verdict} via ${source === 'deterministic' ? 'API Resolver' : 'AI Oracle'}.`,
		link: `/market/${symbol || marketId}`,
		metadata: { marketId, verdict, source, score },
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

	logger.info(
		`[oracle.resolved] Notified ${admins.length} admins about auto-resolved market ${marketId}`,
	);
}
