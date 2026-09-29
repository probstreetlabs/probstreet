import { Hono } from 'hono';
import { Server } from 'socket.io';
import { createServer } from 'http';
import { logger } from '@/libs/logger';
import { routes } from '@/routes/routes';
import { captureError } from '@/libs/sentry';
import { getRequestListener } from '@hono/node-server';
import { httpInstrumentationMiddleware } from '@hono/otel';

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

io.on('connection', (socket) => {
	logger.debug(`Client connected SOCKET ID : ${socket.id}`);

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
		socket.join(`user:${userId}`);
		socket.join(userId);
	});

	socket.on('UNSUBSCRIBE_USER', (userId: string) => {
		socket.leave(`user:${userId}`);
		socket.leave(userId);
	});

	socket.on('SUBSCRIBE', (room: string) => {
		socket.join(room);
		socket.join(`ticker:${room}`);
		socket.join(`market:${room}`);
		socket.join(`user:${room}`);
	});

	socket.on('UNSUBSCRIBE', (room: string) => {
		socket.leave(room);
		socket.leave(`ticker:${room}`);
		socket.leave(`market:${room}`);
		socket.leave(`user:${room}`);
	});

	socket.on('disconnect', () => {
		logger.debug(`Client disconnected SOCKET ID : ${socket.id}`);
	});
});
