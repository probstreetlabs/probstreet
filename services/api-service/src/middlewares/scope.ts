import { Context, Next } from 'hono';
import { ApiKeyScope } from '@/utils/apiKey';

/**
 * Scope enforcement middleware.
 * If request is authenticated via an API Key, verifies that the key has at least one of the required scopes.
 * If request is authenticated via a standard User JWT session, passes through transparently.
 */
export const requireScope = (...requiredScopes: ApiKeyScope[]) => {
	return async (c: Context, next: Next) => {
		const user = c.get('user');

		if (!user) {
			return c.json({ success: false, message: 'Unauthorized' }, 401);
		}

		// Only enforce scopes if authenticated via an API key
		if (user.apiKeyId) {
			const scopes: string[] = user.scopes || [];
			const hasScope = requiredScopes.some((s) => scopes.includes(s) || scopes.includes('*'));

			if (!hasScope) {
				const scopeNames = requiredScopes.join(' or ');
				return c.json(
					{
						success: false,
						error: `Forbidden: API key lacks required scope '${scopeNames}'`,
						message: `Forbidden: API key lacks required scope '${scopeNames}'`,
					},
					403,
				);
			}
		}

		await next();
	};
};
