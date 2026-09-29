import { Pool } from 'pg';
import { logger } from '@/libs/logger';
import { captureError } from '@/libs/sentry';

const pool = new Pool({
	connectionString: process.env.DATABASE_URL,
});

export const initDLQTable = async () => {
	try {
		await pool.query(`
			CREATE TABLE IF NOT EXISTS dead_letter_queue (
				id SERIAL PRIMARY KEY,
				event_type VARCHAR(255) NOT NULL,
				payload JSONB NOT NULL,
				error_message TEXT,
				failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
			);
		`);
		logger.info('DLQ table initialized successfully');
	} catch (error) {
		logger.error({ error }, 'Failed to initialize DLQ table');
		captureError(error, { tags: { action: 'DLQ_INIT_FAIL', controller: 'dlq' } });
	}
};

export const pushToDLQ = async (eventType: string, payload: any, errorMessage: string) => {
	try {
		await pool.query(
			`INSERT INTO dead_letter_queue (event_type, payload, error_message) VALUES ($1, $2, $3)`,
			[eventType || 'UNKNOWN', payload, errorMessage],
		);
		logger.info({ eventType }, 'Pushed message to DLQ');
	} catch (error) {
		logger.error({ error, payload }, 'Failed to push message to DLQ');
		captureError(error, {
			tags: { action: 'DLQ_PUSH_FAIL', controller: 'dlq' },
			contexts: { payload },
		});
	}
};
