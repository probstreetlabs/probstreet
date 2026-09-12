package redis

import (
	"context"
	"encoding/json"
	"fmt"
	"matching-engine/internals/router"
	"matching-engine/internals/types"
	"matching-engine/internals/utils"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

func Consumer(ctx context.Context, client *redis.Client) {

	log.Info().Msg("Consumer started and ready to consume messages")

	for {
		func() {
			defer func() {
				if r := recover(); r != nil {
					err := fmt.Errorf("panic in matching engine: %v", r)
					utils.CaptureError(err, map[string]string{"controller": "consumer", "action": "PANIC_RECOVERY"}, nil)
					log.Error().Err(err).Msg("Recovered from panic in matching engine consumer loop")
				}
			}()

			result, err := client.BRPop(ctx, 5*time.Minute, "engine:queue").Result()

			if err != nil {
				if err == redis.Nil {
					// Expected timeout
					return
				}
				utils.CaptureError(err, map[string]string{"controller": "consumer", "action": "REDIS_BRPOP"}, nil)
				log.Warn().Err(err).Msg("Failed to consume from queue")
				return
			}

			if len(result) != 2 {
				log.Warn().Msg("invalid BRPop result length")
				return
			}

			var data types.QueuePayload

			err = json.Unmarshal([]byte(result[1]), &data)

			if err != nil {
				utils.CaptureError(err, map[string]string{"controller": "consumer", "action": "PARSE_PAYLOAD"}, map[string]map[string]interface{}{"redis": {"message": result[1]}})
				log.Error().Err(err).Str("payload", result[1]).Msg("Failed to unmarshal payload")
				return
			}

			log.Info().
				Str("eventType", data.EventType).
				Str("responseId", data.ResponseId).
				Interface("data", data.Data).
				Msg("Successfully parsed queue payload")

			response := router.RouteEvent(data)

			responseJSON, err := json.Marshal(response)

			if err != nil {
				log.Error().Err(err).Msg("Failed to marshal response")
				return
			}

			responseKey := "engine:response:" + response.ResponseId

			err = client.Publish(ctx, responseKey, responseJSON).Err()

			if err != nil {
				utils.CaptureError(err, map[string]string{"controller": "consumer", "action": "PUBLISH_RESPONSE"}, map[string]map[string]interface{}{"redis": {"responseId": response.ResponseId}})
				log.Error().Err(err).Str("responseId", response.ResponseId).Msg("Failed to send response to api")
			} else {
				log.Info().Str("responseId", response.ResponseId).Msg("Response send to api successfully")
			}
		}()
	}

}
