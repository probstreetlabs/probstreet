package utils

import (
	"bytes"
	"encoding/json"
	"net/http"
	"strconv"
	"time"
)

type OTLPWriter struct {
	apiKey      string
	endpoint    string
	serviceName string
	logsCh      chan []byte
}

func NewOTLPWriter(serviceName, apiKey, endpoint string) *OTLPWriter {
	if endpoint == "" {
		endpoint = "https://otlp.eu01.nr-data.net:4318"
	}
	w := &OTLPWriter{
		apiKey:      apiKey,
		endpoint:    endpoint + "/v1/logs",
		serviceName: serviceName,
		logsCh:      make(chan []byte, 10000),
	}
	if apiKey != "" {
		go w.worker()
	}
	return w
}

func (w *OTLPWriter) Write(p []byte) (n int, err error) {
	if w.apiKey == "" {
		return len(p), nil
	}

	buf := make([]byte, len(p))
	copy(buf, p)

	select {
	case w.logsCh <- buf:
	default:
	}
	return len(p), nil
}

func (w *OTLPWriter) worker() {
	var buffer [][]byte
	ticker := time.NewTicker(1 * time.Second)

	flush := func() {
		if len(buffer) == 0 {
			return
		}

		logsToProcess := buffer
		buffer = nil

		var logRecords []map[string]interface{}

		for _, b := range logsToProcess {
			var logData map[string]interface{}
			if err := json.Unmarshal(b, &logData); err != nil {
				continue
			}

			levelStr, _ := logData["level"].(string)
			severityNumber := 9
			switch levelStr {
			case "debug":
				severityNumber = 13
			case "info":
				severityNumber = 17
			case "warn":
				severityNumber = 21
			case "error":
				severityNumber = 25
			case "fatal":
				severityNumber = 29
			}

			var timeUnixNano string
			if tFloat, ok := logData["time"].(float64); ok {
				timeUnixNano = strconv.FormatInt(int64(tFloat*1e9), 10)
			} else {
				timeUnixNano = strconv.FormatInt(time.Now().UnixNano(), 10)
			}

			record := map[string]interface{}{
				"timeUnixNano":   timeUnixNano,
				"severityNumber": severityNumber,
				"severityText":   levelStr,
				"body": map[string]interface{}{
					"stringValue": string(b),
				},
			}

			if traceID, ok := logData["trace_id"].(string); ok {
				record["traceId"] = traceID
			}
			if spanID, ok := logData["span_id"].(string); ok {
				record["spanId"] = spanID
			}

			logRecords = append(logRecords, record)
		}

		if len(logRecords) == 0 {
			return
		}

		payload := map[string]interface{}{
			"resourceLogs": []map[string]interface{}{
				{
					"resource": map[string]interface{}{
						"attributes": []map[string]interface{}{
							{
								"key": "service.name",
								"value": map[string]interface{}{
									"stringValue": w.serviceName,
								},
							},
						},
					},
					"scopeLogs": []map[string]interface{}{
						{
							"logRecords": logRecords,
						},
					},
				},
			},
		}

		payloadBytes, _ := json.Marshal(payload)
		req, _ := http.NewRequest("POST", w.endpoint, bytes.NewBuffer(payloadBytes))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("api-key", w.apiKey)

		client := &http.Client{Timeout: 5 * time.Second}
		client.Do(req)
	}

	for {
		select {
		case b := <-w.logsCh:
			buffer = append(buffer, b)
			if len(buffer) >= 50 {
				flush()
			}
		case <-ticker.C:
			flush()
		}
	}
}
