import { z } from 'zod';
import { VALID_SCOPES } from '@/utils/apiKey';

export const createApiKeySchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, { message: 'Key name is required' })
		.max(50, { message: 'Key name cannot exceed 50 characters' }),
	scopes: z
		.array(z.enum(VALID_SCOPES))
		.min(1, { message: 'At least one permission scope is required' }),
	expiresInDays: z.number().int().positive().max(365).nullable().optional(),
});

export const updateApiKeySchema = z.object({
	name: z.string().trim().min(1).max(50).optional(),
	isActive: z.boolean().optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;
export type UpdateApiKeyInput = z.infer<typeof updateApiKeySchema>;
