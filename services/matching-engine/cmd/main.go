package main

import (
	"context"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/getsentry/sentry-go"

	"matching-engine/internals/engine"
	"matching-engine/internals/services/kafka"
	"matching-engine/internals/services/redis"
	"matching-engine/internals/utils"

	"github.com/joho/godotenv"
	"github.com/rs/zerolog/log"
)

func main() {

	if err := godotenv.Load(); err != nil {
		fmt.Println("Failed to load Enviourment variables")
	}

	utils.InitLogger()
	log.Info().Msg("Logger initialized successfully")

	utils.SetupSentry()
	defer sentry.Flush(2 * time.Second)

	shutdownOTel := utils.SetupOTel("probstreet-matching-engine")
	defer shutdownOTel()

	client := redis.ConnectRedis()

	kafka.InitProducer()
	defer kafka.CloseProducer()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	engine.InitEngine(client)
	log.Info().Msg("Matching engine initialized successfully")

	sigCh := make(chan os.Signal, 1)
	
	signal.Notify(sigCh, syscall.SIGTERM, syscall.SIGINT)
	go func() {
		<-sigCh
		log.Info().Msg("Received shutdown signal, performing final snapshot...")
		if engine.EngineInstance != nil {
			engine.EngineInstance.PerformSnapshot()
			engine.CloseSnapshotDB()
		}
		kafka.CloseProducer()
		os.Exit(0)
	}()

	log.Info().Msg("Matching Engine started successfully")

	redis.Consumer(ctx, client)

}
