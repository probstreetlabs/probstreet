import { Hono } from 'hono';
import { generalLimiter } from '@/middlewares/limiter';
import { getLeaderboard } from '@/controllers/leaderboard';
import { optionalAuthorization } from '@/middlewares/optionalAuthorization';

export const leaderboardRoutes = new Hono();

leaderboardRoutes.get('/', optionalAuthorization, generalLimiter, getLeaderboard);
