import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';
import SnappyCodec from 'kafkajs-snappy';
import { CompressionCodecs, CompressionTypes, Kafka, Partitioners, logLevel } from 'kafkajs';

CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

export const kafkaClient = new Kafka({
	logLevel: logLevel.ERROR,
	brokers: [ENV.KAFKA_BROKERS],
	clientId: 'processor-service-consumer',
	retry: {
		initialRetryTime: 1000,
		retries: 10,
		maxRetryTime: 30000,
	},
});

export const producer = kafkaClient.producer({
	createPartitioner: Partitioners.LegacyPartitioner,
});
export const consumer = kafkaClient.consumer({ groupId: 'group-1' });

export const connectProducer = async () => {
	logger.info('Producer is connected');
	await producer.connect();
};

export const disconnectProducer = async () => {
	await producer.disconnect();
};
