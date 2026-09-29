import pkg from 'pg';
const { Pool } = pkg;
import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';

let snapshotDbPool: pkg.Pool | null = null;

if (ENV.SNAPSHOT_DB_URL) {
	snapshotDbPool = new Pool({
		connectionString: ENV.SNAPSHOT_DB_URL,
		max: 10,
	});

	snapshotDbPool.on('connect', () => {
		logger.info('Snapshot DB connected successfully');
	});

	snapshotDbPool.on('error', (err) => {
		logger.error(`Failed to connect to Snapshot DB : ${err.message}`);
	});
}

export { snapshotDbPool };
