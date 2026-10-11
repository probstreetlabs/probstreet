import http from 'k6/http';
import { check } from 'k6';
import { getOptions } from '../lib/thresholds.js';
import { setupAuth } from '../lib/auth-setup.js';

export const options = getOptions(__ENV.TEST_TYPE || 'smoke', 'cached_read');

export function setup() {
	return setupAuth();
}

export default function (data) {
	const { baseUrl, token } = data;

	const params = {
		headers: {
			Authorization: `Bearer ${token}`,
		},
	};

	const res = http.get(`${baseUrl}/api/v1/capi/balance`, params);

	check(res, {
		'balance read successfully': (r) => r.status === 200,
	});
}
