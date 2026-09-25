import { Hono } from 'hono';
import { authorization } from '@/middlewares/authorization';
import {
	getSettings,
	updateProfile,
	updateNotifications,
	deleteAccount,
	generateAvatarUploadSignatureRoute,
} from '@/controllers/settings';

export const settingsRoutes = new Hono();

settingsRoutes.use('/*', authorization);

settingsRoutes.get('/', getSettings);
settingsRoutes.put('/profile', updateProfile);
settingsRoutes.delete('/account', deleteAccount);
settingsRoutes.put('/notifications', updateNotifications);
settingsRoutes.get('/avatar-signature', generateAvatarUploadSignatureRoute);
