import { producer } from './client';

export const produceToRetryTopic = async (message: string, retryCount: number) => {
	await producer.send({
		topic: 'process_db_retry',
		messages: [
			{
				value: message,
				headers: { retryCount: retryCount.toString() },
			},
		],
	});
};
