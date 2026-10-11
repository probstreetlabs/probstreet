export function setupAuth() {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
	const token = __ENV.AUTH_TOKEN || '';

	if (!token) {
		console.warn('No AUTH_TOKEN provided via environment variables! Auth requests will fail.');
	}

	return { token, baseUrl };
}
