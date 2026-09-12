package redis

import (
	"context"
	"matching-engine/internals/utils"
	"os"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

func ConnectRedis() *redis.Client {

	url := os.Getenv("REDIS_URL")

	option, err := redis.ParseURL(url)

	if err != nil {
		log.Fatal().Err(err).Msg("failed to parse redis url")
	}

	client := redis.NewClient(option)

	_, err = client.Ping(context.Background()).Result()

	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "redis", "action": "PING_FAIL"}, nil)
		log.Error().Err(err).Msg("Failed to connect to Redis")
	} else {
		log.Info().Msg("connected to redis")
	}

	return client

}
