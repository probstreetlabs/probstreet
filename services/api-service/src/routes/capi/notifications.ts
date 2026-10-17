import { Hono } from 'hono';
import { generalLimiter } from '@/middlewares/limiter';
import { authorization } from '@/middlewares/authorization';
import { getNotifications, markAsRead } from '@/controllers/notifications';

export const notificationsRoutes = new Hono();

notificationsRoutes.use('*', authorization, generalLimiter);

notificationsRoutes.get('/', getNotifications);
notificationsRoutes.patch('/read', markAsRead);
