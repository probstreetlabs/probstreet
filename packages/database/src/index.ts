import ws from 'ws';
import { PrismaClient } from './generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { neonConfig } from '@neondatabase/serverless';

if (typeof globalThis.WebSocket === 'undefined') {
	neonConfig.webSocketConstructor = ws;
}

const globalForPrisma = globalThis as unknown as {
	prisma: PrismaClient | undefined;
};

export const prisma =
	globalForPrisma.prisma ??
	new PrismaClient({
		log: ['info', 'warn', 'error'],
	});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export const createEdgePrisma = (connectionString: string) => {
	const adapter = new PrismaNeon({ connectionString });

	return new PrismaClient({ adapter });
};

export * from './generated/prisma';
