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

	// load env variables
	if err := godotenv.Load(); err != nil {
		fmt.Println("Failed to load env")
	}

	// Initialize zerolog logger
	utils.InitLogger()
	log.Info().Msg("Logger initialized")

	// Initialize Sentry
	utils.SetupSentry()
	defer sentry.Flush(2 * time.Second)

	// connect to redis
	client := redis.ConnectRedis()

	// conect to kafka
	kafka.InitProducer()
	defer kafka.CloseProducer()

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize engine
	engine.InitEngine(client)
	log.Info().Msg("Matching engine initialized")

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
