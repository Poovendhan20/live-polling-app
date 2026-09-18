package services

import (
	"context"
	"errors"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"live-polling-app/backend/internal/models"
	"live-polling-app/backend/internal/repository"
	"strings"
	"time"
)

type PollService struct {
	Polls *mongo.Collection
	Votes *mongo.Collection
	Redis *repository.RedisRepo
}

func (s *PollService) Create(ctx context.Context, owner primitive.ObjectID, q string, opts []string) (models.Poll, error) {
	q = strings.TrimSpace(q)
	clean := []string{}
	for _, o := range opts {
		if v := strings.TrimSpace(o); v != "" {
			clean = append(clean, v)
		}
	}
	if len(q) < 5 || len(clean) < 2 || len(clean) > 8 {
		return models.Poll{}, errors.New("question and 2 to 8 options are required")
	}
	p := models.Poll{ID: primitive.NewObjectID(), OwnerID: owner, Question: q, Options: clean, CreatedAt: primitive.NewDateTimeFromTime(time.Now())}
	_, e := s.Polls.InsertOne(ctx, p)
	return p, e
}
func (s *PollService) Get(ctx context.Context, id primitive.ObjectID) (models.Poll, error) {
	var p models.Poll
	e := s.Polls.FindOne(ctx, bson.M{"_id": id}).Decode(&p)
	return p, e
}
