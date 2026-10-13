import { Hono } from 'hono';
import { authorization } from '@/middlewares/authorization';
import {
	getSettings,
	updateProfile,
	updateNotifications,
	deleteAccount,
	generateAvatarUploadSignatureRoute,
	createApiKey,
	listApiKeys,
	revokeApiKey,
	updateApiKey,
} from '@/controllers/settings';

export const settingsRoutes = new Hono();

settingsRoutes.use('/*', authorization);

settingsRoutes.get('/', getSettings);
settingsRoutes.put('/profile', updateProfile);
settingsRoutes.delete('/account', deleteAccount);
settingsRoutes.put('/notifications', updateNotifications);
settingsRoutes.get('/avatar-signature', generateAvatarUploadSignatureRoute);

settingsRoutes.get('/api-keys', listApiKeys);
settingsRoutes.post('/api-keys', createApiKey);
settingsRoutes.patch('/api-keys/:id', updateApiKey);
settingsRoutes.delete('/api-keys/:id', revokeApiKey);
