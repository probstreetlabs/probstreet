package utils

import (
	"os"

	"github.com/getsentry/sentry-go"
	"github.com/rs/zerolog/log"
)

func SetupSentry() {
	appEnv := os.Getenv("APP_ENV")

	if appEnv == "" {
		appEnv = os.Getenv("NODE_ENV")
	}
	dsn := os.Getenv("SENTRY_DSN")

	if appEnv == "development" || appEnv == "dev" || appEnv == "" || dsn == "" {
		log.Info().Msg("Sentry is disabled (development mode or no DSN)")
		return
	}

	err := sentry.Init(sentry.ClientOptions{
		Dsn:         dsn,
		Environment: appEnv,
		Release:     os.Getenv("SENTRY_RELEASE"),
	})

	if err != nil {
		log.Error().Err(err).Msg("sentry.Init failed")
	} else {
		log.Info().Msg("Sentry initialized")
	}
}

func CaptureError(err error, tags map[string]string, contexts map[string]map[string]interface{}) {
	appEnv := os.Getenv("APP_ENV")

	if appEnv == "" {
		appEnv = os.Getenv("NODE_ENV")
	}

	dsn := os.Getenv("SENTRY_DSN")

	if appEnv == "development" || appEnv == "dev" || appEnv == "" || dsn == "" {
		return
	}

	sentry.WithScope(func(scope *sentry.Scope) {
		if tags != nil {
			scope.SetTags(tags)
		}

		for key, val := range contexts {
			scope.SetContext(key, sentry.Context(val))
		}
		sentry.CaptureException(err)
	})
}
