import crypto from 'crypto';

export const API_KEY_PREFIX = 'prob_live_';

export const VALID_SCOPES = ['market:read', 'orders:read', 'orders:write', 'wallet:read'] as const;

export type ApiKeyScope = (typeof VALID_SCOPES)[number];

export interface GeneratedApiKey {
	rawKey: string;
	keyPrefix: string;
	keyHash: string;
}

/**
 * Generates a cryptographically secure API key.
 * Format: prob_live_<40 random url-safe characters>
 * Returns raw secret (shown once), public prefix (for UI), and SHA-256 hash (for DB storage).
 */

export const generateApiKey = (): GeneratedApiKey => {
	const randomBytes = crypto.randomBytes(30).toString('base64url');
	const rawKey = `${API_KEY_PREFIX}${randomBytes}`;
	const keyPrefix = rawKey.slice(0, 18);
	const keyHash = hashApiKey(rawKey);

	return {
		rawKey,
		keyPrefix,
		keyHash,
	};
};

export const hashApiKey = (rawKey: string): string => {
	return crypto.createHash('sha256').update(rawKey).digest('hex');
};
