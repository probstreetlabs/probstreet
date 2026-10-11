export function getOptions(testType, endpointClass) {
	const thresholds = {
		http_req_failed: ['rate<0.01'],
	};

	if (endpointClass === 'cached_read') {
		thresholds.http_req_duration = ['p(95)<150', 'p(99)<300'];
	} else if (endpointClass === 'live_read') {
		thresholds.http_req_duration = ['p(95)<100', 'p(99)<250'];
	} else if (endpointClass === 'write') {
		thresholds.http_req_duration = ['p(95)<400', 'p(99)<800'];
	} else if (endpointClass === 'login') {
		thresholds.http_req_duration = ['p(95)<300', 'p(99)<600'];
	} else if (endpointClass === 'leaderboard') {
		thresholds.http_req_duration = ['p(95)<100', 'p(99)<250'];
	}

	let stages = [];
	if (testType === 'smoke') {
		stages = [{ duration: '30s', target: 2 }];
	} else if (testType === 'load') {
		const vus = __ENV.TEST_VUS ? parseInt(__ENV.TEST_VUS, 10) : 300;
		stages = [
			{ duration: '10s', target: vus },
			{ duration: '20s', target: vus },
			{ duration: '10s', target: 0 },
		];
	} else if (testType === 'stress') {
		stages = [
			{ duration: '1m', target: 200 },
			{ duration: '2m', target: 500 },
			{ duration: '2m', target: 1000 },
			{ duration: '1m', target: 0 },
		];
	} else if (testType === 'soak') {
		// TODO: implement soak test stages properly
		console.warn('Soak test not fully implemented yet, running minimal load.');
		stages = [
			{ duration: '1m', target: 50 },
			{ duration: '60m', target: 50 },
			{ duration: '1m', target: 0 },
		];
	}

	return { thresholds, stages };
}
