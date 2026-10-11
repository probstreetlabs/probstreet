import http from 'k6/http';
import { check } from 'k6';
import { getOptions } from '../lib/thresholds.js';
import { setupAuth } from '../lib/auth-setup.js';

export const options = getOptions(__ENV.TEST_TYPE || 'smoke', 'write');

export function setup() {
	return setupAuth();
}

export default function (data) {
	const { baseUrl, token } = data;
	const marketId = __ENV.TEST_MARKET_ID || '1';
	const symbol = __ENV.TEST_MARKET_SYMBOL || '1';

	const payload = JSON.stringify({
		marketId,
		symbol,
		side: 'YES',
		orderType: 'LIMIT',
		price: 1,
		quantity: 1,
	});

	const params = {
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${token}`,
		},
	};

	const res = http.post(`${baseUrl}/api/v1/capi/order/buy`, payload, params);

	check(res, {
		'order created successfully': (r) => r.status === 200 || r.status === 201,
	});
}
