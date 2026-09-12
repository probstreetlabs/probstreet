package engine

import (
	"context"
	"matching-engine/internals/utils"

	"github.com/rs/zerolog/log"
)

func (e *Engine) BroadcastMessage(channel string, message string) {
	if e.Redis == nil {
		return
	}

	err := e.Redis.Publish(context.Background(), channel, message).Err()

	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "engine", "action": "BROADCAST_MESSAGE"}, nil)
		log.Error().Err(err).Msg("failed to broadcast message to stream service")
	}

}
