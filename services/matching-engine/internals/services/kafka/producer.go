package kafka

import (
	"encoding/json"
	"matching-engine/internals/utils"
	"os"
	"sync"

	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/rs/zerolog/log"
)

var (
	producerInstance *kafka.Producer
	once             sync.Once
)

type Event struct {
	Type string      `json:"type"`
	Data interface{} `json:"data"`
}

func InitProducer() {
	once.Do(func() {
		brokers := os.Getenv("KAFKA_BROKERS")
		if brokers == "" {
			brokers = "localhost:9092"
		}
		producer, err := kafka.NewProducer(&kafka.ConfigMap{
			"bootstrap.servers":  brokers,
			"compression.type":   "snappy",
			"retries":            10,
			"message.timeout.ms": 30000,
		})

		if err != nil {
			utils.CaptureError(err, map[string]string{"controller": "kafka", "action": "NEW_PRODUCER"}, nil)
			log.Fatal().Msgf("Failed to connect to Kafka instance : %v", err.Error())
		}
		producerInstance = producer

		go func() {
			for e := range producerInstance.Events() {
				switch ev := e.(type) {
				case *kafka.Message:
					if ev.TopicPartition.Error != nil {
						utils.CaptureError(ev.TopicPartition.Error, map[string]string{"controller": "kafka", "action": "DELIVERY_REPORT_ERROR"}, nil)
						log.Error().Msgf("Kafka delivery failed : %v", ev.TopicPartition.Error.Error())
					} else {
						log.Debug().
							Interface("topicPartition", ev.TopicPartition).
							Msg("Kafka message delivered successfully")
					}
				}
			}
		}()

		log.Info().Msg("Kafka Producer is connected successfully")
	})
}

func ProduceEventToDBProcessor(topic, eventType string, data interface{}) error {
	if producerInstance == nil {
		log.Error().Msg("Producer not initialized")
		return nil
	}

	event := Event{
		Type: eventType,
		Data: data,
	}
	bytes, err := json.Marshal(event)
	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "kafka", "action": "PRODUCE_MARSHAL"}, nil)
		return err
	}

	err = producerInstance.Produce(&kafka.Message{
		TopicPartition: kafka.TopicPartition{
			Topic:     &topic,
			Partition: kafka.PartitionAny,
		},
		Value: bytes,
	}, nil)

	if err != nil {
		utils.CaptureError(err, map[string]string{"controller": "kafka", "action": "PRODUCE_EVENT"}, nil)
	}

	return err
}

func CloseProducer() {
	if producerInstance != nil {
		producerInstance.Flush(5000)
		producerInstance.Close()
		log.Info().Msg("Kafka Producer is disconnected successfully")
	}
}
