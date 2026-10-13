import api from '@/config/axios';

export interface ApiKeyItem {
	id: string;
	name: string;
	keyPrefix: string;
	scopes: string[];
	isActive: boolean;
	lastUsedAt: string | null;
	expiresAt: string | null;
	createdAt: string;
}

export interface CreateApiKeyResponse {
	id: string;
	name: string;
	apiKey: string;
	keyPrefix: string;
	scopes: string[];
	expiresAt: string | null;
	createdAt: string;
}

export const fetchApiKeys = async () => {
	const res = await api.get('/settings/api-keys');
	return res.data?.data || [];
};

export const createApiKey = async (payload: {
	name: string;
	scopes: string[];
	expiresInDays?: number | null;
}) => {
	const res = await api.post('/settings/api-keys', payload);
	return res.data?.data as CreateApiKeyResponse;
};

export const revokeApiKey = async (id: string) => {
	const res = await api.delete(`/settings/api-keys/${id}`);
	return res.data;
};

export const updateApiKey = async (id: string, payload: { name?: string; isActive?: boolean }) => {
	const res = await api.patch(`/settings/api-keys/${id}`, payload);
	return res.data?.data;
};
