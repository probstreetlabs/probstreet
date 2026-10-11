import http from 'k6/http';
import { check } from 'k6';
import { getOptions } from '../lib/thresholds.js';

export const options = getOptions(__ENV.TEST_TYPE || 'smoke', 'live_read');

export default function () {
	const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';
	const symbol = __ENV.TEST_MARKET_SYMBOL || '1';

	const res = http.get(`${baseUrl}/api/v1/capi/market/${symbol}/live`);

	check(res, {
		'market live read successfully': (r) => r.status === 200,
	});
}
