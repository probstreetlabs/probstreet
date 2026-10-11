import http from 'k6/http';
import { check } from 'k6';
import { getOptions } from '../lib/thresholds.js';

export const options = getOptions(__ENV.TEST_TYPE || 'smoke', 'cached_read');

export default function () {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
	const username = __ENV.TEST_USERNAME || 'rehan';

	const res = http.get(`${baseUrl}/api/v1/capi/profile/${username}`);

	check(res, {
		'profile read successfully': (r) => r.status === 200,
	});
}
