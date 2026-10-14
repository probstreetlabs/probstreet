import { Hono } from 'hono';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { logger } from '@/libs/logger';
import { routes } from '@/routes/routes';
import { captureError } from '@/libs/sentry';
import { getRequestListener } from '@hono/node-server';
import { httpInstrumentationMiddleware } from '@hono/otel';
import { verifyStreamAuth, AuthenticatedUser } from '@/libs/auth';

const app = new Hono();

app.use('*', httpInstrumentationMiddleware());

app.route('/api/v1', routes);

app.onError((err, c) => {
	const status = 'status' in err ? (err as any).status : 500;

	if (status >= 500) {
		captureError(err, { tags: { controller: 'global', action: 'UNHANDLED_EXCEPTION' } });
	}

	return c.json({ success: false, error: 'Internal server error' }, status);
});

export const httpServer = createServer(getRequestListener(app.fetch));

export const io = new Server(httpServer, {
	cors: {
		origin: true,
		credentials: true,
		methods: ['GET', 'POST'],
	},
	transports: ['websocket', 'polling'],
});

io.use(async (socket, next) => {
	try {
		const auth = socket.handshake.auth || {};
		const query = socket.handshake.query || {};
		const headers = socket.handshake.headers || {};
		const cookie = headers.cookie;

		const apiKey = (auth.apiKey || query.apiKey || headers['x-api-key']) as string | undefined;
		const token = (auth.token || query.token || headers.authorization) as string | undefined;

		const user = await verifyStreamAuth({ apiKey, token, cookie });
		if (user) {
			socket.data.user = user;
		}
	} catch (err: any) {
		logger.warn(`Stream handshake auth warning for socket ${socket.id}: ${err?.message}`);
	}
	next();
});

io.on('connection', (socket) => {
	const initialUser: AuthenticatedUser | undefined = socket.data.user;

	if (initialUser) {
		socket.join(`user:${initialUser.id}`);
		socket.join(initialUser.id);
		logger.debug(
			`Authenticated client connected: ${socket.id} (User: ${initialUser.id}, API Key: ${!!initialUser.isApiKey})`,
		);
		socket.emit('AUTHENTICATED', { success: true, userId: initialUser.id });
	} else {
		logger.debug(`Guest client connected: ${socket.id}`);
	}

	socket.on(
		'AUTHENTICATE',
		async (credentials: { token?: string; apiKey?: string } | undefined) => {
			const user = await verifyStreamAuth({
				token: credentials?.token,
				apiKey: credentials?.apiKey,
				cookie: socket.handshake.headers.cookie,
			});

			if (user) {
				socket.data.user = user;
				socket.join(`user:${user.id}`);
				socket.join(user.id);
				logger.debug(
					`Client authenticated via event: ${socket.id} (User: ${user.id}, API Key: ${!!user.isApiKey})`,
				);
				socket.emit('AUTHENTICATED', { success: true, userId: user.id });
			} else {
				socket.emit('AUTHENTICATED', { success: false, message: 'Invalid credentials' });
			}
		},
	);

	socket.on('SUBSCRIBE_TICKERS', (symbols: string | string[]) => {
		const list = Array.isArray(symbols) ? symbols : [symbols];
		list.forEach((sym) => socket.join(`ticker:${sym}`));
	});

	socket.on('UNSUBSCRIBE_TICKERS', (symbols: string | string[]) => {
		const list = Array.isArray(symbols) ? symbols : [symbols];
		list.forEach((sym) => socket.leave(`ticker:${sym}`));
	});

	socket.on('SUBSCRIBE_MARKET', (symbol: string) => {
		socket.join(`market:${symbol}`);
	});

	socket.on('UNSUBSCRIBE_MARKET', (symbol: string) => {
		socket.leave(`market:${symbol}`);
	});

	socket.on('SUBSCRIBE_USER', (userId: string) => {
		const currentUser: AuthenticatedUser | undefined = socket.data.user;

		if (!currentUser) {
			socket.emit('ERROR', {
				code: 'UNAUTHORIZED',
				message: 'Authentication required to subscribe to private user feed',
			});
			return;
		}

		if (currentUser.id !== userId) {
			socket.emit('ERROR', {
				code: 'FORBIDDEN',
				message: 'Cannot subscribe to another user private feed',
			});
			return;
		}

		socket.join(`user:${userId}`);
		socket.join(userId);
		socket.emit('SUBSCRIBED_USER', { userId });
	});

	socket.on('UNSUBSCRIBE_USER', (userId: string) => {
		socket.leave(`user:${userId}`);
		socket.leave(userId);
	});

	socket.on('SUBSCRIBE', (room: string) => {
		if (typeof room !== 'string') return;

		if (room.startsWith('user:')) {
			const targetUserId = room.replace('user:', '');
			const currentUser: AuthenticatedUser | undefined = socket.data.user;

			if (!currentUser || currentUser.id !== targetUserId) {
				socket.emit('ERROR', {
					code: 'UNAUTHORIZED',
					message: 'Authentication required to subscribe to private user feed',
				});
				return;
			}
			socket.join(room);
			return;
		}

		socket.join(room);
		socket.join(`ticker:${room}`);
		socket.join(`market:${room}`);
	});

	socket.on('UNSUBSCRIBE', (room: string) => {
		if (typeof room !== 'string') return;
		socket.leave(room);
		socket.leave(`ticker:${room}`);
		socket.leave(`market:${room}`);
		socket.leave(`user:${room}`);
	});

	socket.on('disconnect', () => {
		logger.debug(`Client disconnected SOCKET ID : ${socket.id}`);
	});
});
