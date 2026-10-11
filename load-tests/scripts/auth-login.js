import http from 'k6/http';
import { check } from 'k6';
import { getOptions } from '../lib/thresholds.js';

export const options = getOptions(__ENV.TEST_TYPE || 'smoke', 'login');

export default function () {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
	const email = __ENV.AUTH_EMAIL || 'test@example.com';
	const password = __ENV.AUTH_PASSWORD || 'password123';

	const payload = JSON.stringify({ email, password });
	const params = { headers: { 'Content-Type': 'application/json' } };

	const res = http.post(`${baseUrl}/api/v1/capi/auth/init-signin`, payload, params);

	check(res, {
		'login successful': (r) => r.status === 200 || r.status === 201,
	});
}
