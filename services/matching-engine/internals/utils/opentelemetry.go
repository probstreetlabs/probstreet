package utils

import (
	"context"
	"os"
	"time"

	"github.com/rs/zerolog/log"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

func SetupOTel(serviceName string) func() {
	appEnv := os.Getenv("APP_ENV")
	if appEnv == "" {
		appEnv = os.Getenv("NODE_ENV")
	}

	headersStr := os.Getenv("NEW_RELIC_API_KEY")
	endpoint := os.Getenv("OTEL_EXPORTER_OTLP_ENDPOINT")

	if appEnv == "development" || appEnv == "dev" || appEnv == "" || headersStr == "" || endpoint == "" {
		log.Info().Msg("OpenTelemetry is disabled (development mode or missing config)")
		return func() {}
	}

	ctx := context.Background()

	res, err := resource.New(ctx,
		resource.WithAttributes(
			semconv.ServiceName(serviceName),
			semconv.ServiceVersion(os.Getenv("SENTRY_RELEASE")),
		),
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to create OTel resource")
		return func() {}
	}

	headers := map[string]string{
		"api-key": headersStr,
	}

	// Trace Exporter
	traceExporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpointURL(endpoint+"/v1/traces"),
		otlptracehttp.WithHeaders(headers),
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to create OTel trace exporter")
	} else {
		bsp := sdktrace.NewBatchSpanProcessor(traceExporter)
		tracerProvider := sdktrace.NewTracerProvider(
			sdktrace.WithSampler(sdktrace.AlwaysSample()),
			sdktrace.WithResource(res),
			sdktrace.WithSpanProcessor(bsp),
		)
		otel.SetTracerProvider(tracerProvider)
	}

	// Metric Exporter
	metricExporter, err := otlpmetrichttp.New(ctx,
		otlpmetrichttp.WithEndpointURL(endpoint+"/v1/metrics"),
		otlpmetrichttp.WithHeaders(headers),
	)
	if err != nil {
		log.Error().Err(err).Msg("Failed to create OTel metric exporter")
	} else {
		meterProvider := metric.NewMeterProvider(
			metric.WithReader(metric.NewPeriodicReader(metricExporter, metric.WithInterval(10*time.Second))),
			metric.WithResource(res),
		)
		otel.SetMeterProvider(meterProvider)
	}

	log.Info().Msg("OpenTelemetry initialized successfully")

	return func() {
		// Shutdown logic
		ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		if tp, ok := otel.GetTracerProvider().(*sdktrace.TracerProvider); ok {
			_ = tp.Shutdown(ctx)
		}
	}
}
