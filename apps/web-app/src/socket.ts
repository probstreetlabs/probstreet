import { io } from 'socket.io-client';
import api from '@/config/axios';

const url = import.meta.env.VITE_STREAM_SERVICE_URL;

let cachedToken: string | null = null;
let isAuthenticating = false;

export const socket = io(url, {
	autoConnect: true,
	timeout: 5000,
	withCredentials: true,
	transports: ['websocket', 'polling'],
});

export const setSocketToken = (token: string | null) => {
	cachedToken = token;
	socket.auth = token ? { token } : {};

	if (socket.connected) {
		if (token) {
			socket.emit('AUTHENTICATE', { token });
		} else {
			// Disconnect and reconnect as a guest
			socket.disconnect();
			socket.connect();
		}
	} else if (token) {
		socket.connect();
	}
};

export const authenticateSocket = async (token?: string): Promise<boolean> => {
	if (token) {
		setSocketToken(token);
		return true;
	}

	if (isAuthenticating) return false;
	isAuthenticating = true;

	try {
		const res = await api.get('/auth/ws-token');
		if (res.data?.success && res.data.token) {
			setSocketToken(res.data.token);
			return true;
		}
	} catch {
		// Not authenticated or network failure
	} finally {
		isAuthenticating = false;
	}

	return false;
};

export const deauthenticateSocket = () => {
	setSocketToken(null);
};

// Re-authenticate when reconnecting
socket.on('connect', () => {
	if (cachedToken) {
		socket.emit('AUTHENTICATE', { token: cachedToken });
	}
});

// Auto-recover if unauthorized error is emitted while a token is expected
socket.on('ERROR', (err: any) => {
	if (err?.code === 'UNAUTHORIZED' && cachedToken && !isAuthenticating) {
		authenticateSocket();
	}
});
