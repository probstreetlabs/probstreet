import { ENV } from '@/config/env';
import { InfluxDB } from '@influxdata/influxdb-client';

const influxDB = new InfluxDB({
	url: ENV.INFLUX_URL,
	token: ENV.INFLUX_TOKEN,
	timeout: 60000,
});

export const queryApi = influxDB.getQueryApi(ENV.INFLUX_ORG);
