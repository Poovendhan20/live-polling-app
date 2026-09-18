package repository

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"os"

	"github.com/redis/go-redis/v9"
)

type RedisRepo struct{ Client *redis.Client }

func NewRedisClient(ctx context.Context) (*redis.Client, error) {
	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		return nil, fmt.Errorf("REDIS_URL is not configured")
	}

	opts, err := redis.ParseURL(redisURL)
	if err != nil {
		return nil, fmt.Errorf("parse REDIS_URL: %w", err)
	}

	client := redis.NewClient(opts)
	if err := client.Ping(ctx).Err(); err != nil {
		return nil, fmt.Errorf("redis connection failed: %w", err)
	}
	log.Printf("redis connection verified: %s", opts.Addr)
	return client, nil
}

func (r *RedisRepo) Key(pollID string) string     { return "poll:counts:" + pollID }
func (r *RedisRepo) Channel(pollID string) string { return "poll:events:" + pollID }
func (r *RedisRepo) Counts(ctx context.Context, pollID string) (map[string]int64, error) {
	values, err := r.Client.HGetAll(ctx, r.Key(pollID)).Result()
	out := map[string]int64{}
	for key, value := range values {
		var n int64
		fmt.Sscan(value, &n)
		out[key] = n
	}
	return out, err
}
func (r *RedisRepo) Increment(ctx context.Context, pollID string, index int) (map[string]int64, error) {
	if err := r.Client.HIncrBy(ctx, r.Key(pollID), fmt.Sprint(index), 1).Err(); err != nil {
		return nil, err
	}
	counts, _ := r.Counts(ctx, pollID)
	payload, _ := json.Marshal(counts)
	return counts, r.Client.Publish(ctx, r.Channel(pollID), payload).Err()
}
