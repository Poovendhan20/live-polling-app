package config

import (
	"context"
	"os"
	"time"

	"github.com/joho/godotenv"
	"github.com/redis/go-redis/v9"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Config struct{ Port, MongoURI, RedisAddr, JWTSecret string }
type Clients struct {
	Mongo *mongo.Client
	DB    *mongo.Database
	Redis *redis.Client
}

func Load() Config {
	_ = godotenv.Load()
	return Config{Port: env("PORT", "8080"), MongoURI: env("MONGO_URI", "mongodb://localhost:27017"), RedisAddr: env("REDIS_ADDR", "localhost:6379"), JWTSecret: env("JWT_SECRET", "change-me")}
}
func Connect(ctx context.Context, c Config) (*Clients, error) {
	mc, err := mongo.Connect(ctx, options.Client().ApplyURI(c.MongoURI))
	if err != nil {
		return nil, err
	}
	if err = mc.Ping(ctx, nil); err != nil {
		return nil, err
	}
	r := redis.NewClient(&redis.Options{Addr: c.RedisAddr})
	if err = r.Ping(ctx).Err(); err != nil {
		return nil, err
	}
	return &Clients{Mongo: mc, DB: mc.Database("live_polling"), Redis: r}, nil
}
func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

var _ = time.Second
