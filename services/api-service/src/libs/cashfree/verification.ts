import { ENV } from '@/config/env';
import { logger } from '@/libs/logger';

const CASHFREE_SANDBOX_BASE = 'https://sandbox.cashfree.com/verification';

export async function verifyPan(name: string, pan: string) {
	try {
		const response = await fetch(`${CASHFREE_SANDBOX_BASE}/pan/advance`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-client-id': ENV.CASHFREE_VERIFICATION_CLIENT_ID || '',
				'x-client-secret': ENV.CASHFREE_VERIFICATION_CLIENT_SECRET || '',
			},
			body: JSON.stringify({
				name: name,
				pan: pan,
				verification_id: `pan_${crypto.randomUUID()}`,
			}),
		});

		const data = (await response.json()) as any;

		if (!response.ok) {
			logger.warn(
				{
					data,
					status: response.status,
				},
				'Cashfree PAN verification failed',
			);
			return { valid: false, data: null };
		}

		if (data.status === 'VALID') {
			return { valid: true, data };
		}

		return { valid: false, data };
	} catch (error) {
		logger.error({ error }, 'Error verifying PAN with Cashfree');
		return { valid: false, data: null };
	}
}

export async function verifyBankAccount(name: string, account_number: string, ifsc: string) {
	try {
		const response = await fetch(`${CASHFREE_SANDBOX_BASE}/bank-account/sync`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-client-id': ENV.CASHFREE_VERIFICATION_CLIENT_ID || '',
				'x-client-secret': ENV.CASHFREE_VERIFICATION_CLIENT_SECRET || '',
			},
			body: JSON.stringify({
				name: name,
				bank_account: account_number,
				ifsc: ifsc,
			}),
		});

		const data = (await response.json()) as any;

		if (!response.ok) {
			logger.warn({ data, status: response.status }, 'Cashfree Bank verification failed');
			return { valid: false, data: null };
		}

		if (data.account_status === 'VALID' || data.account_status_code === 'ACCOUNT_IS_VALID') {
			return { valid: true, data };
		}

		return { valid: false, data };
	} catch (error) {
		logger.error({ error }, 'Error verifying Bank Account with Cashfree');
		return { valid: false, data: null };
	}
}

export async function verifyUpi(name: string, upi: string) {
	try {
		const response = await fetch(`${CASHFREE_SANDBOX_BASE}/upi/penny-drop`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'x-api-version': '2024-12-01',
				'x-client-id': ENV.CASHFREE_VERIFICATION_CLIENT_ID || '',
				'x-client-secret': ENV.CASHFREE_VERIFICATION_CLIENT_SECRET || '',
			},
			body: JSON.stringify({
				verification_id: `upi_${crypto.randomUUID()}`,
				vpa: upi,
				name: name,
				user_consent: {
					obtained: true,
					type: 'EXPLICIT',
					timestamp: new Date().toISOString(),
					purpose: 'Testing the entire flow for penny drop verification',
				},
			}),
		});

		const data = (await response.json()) as any;

		if (!response.ok) {
			logger.warn(
				{
					data,
					status: response.status,
				},
				'Cashfree UPI verification failed',
			);
			return { valid: false, data: null };
		}

		if (data.status === 'VALID') {
			return { valid: true, data };
		}

		return { valid: false, data };
	} catch (error) {
		logger.error({ error }, 'Error verifying UPI with Cashfree');
		return { valid: false, data: null };
	}
}
