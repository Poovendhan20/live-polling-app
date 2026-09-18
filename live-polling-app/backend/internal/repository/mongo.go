package repository

import (
	"context"
	"live-polling-app/backend/internal/models"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type MongoRepo struct{ DB *mongo.Database }

func (r *MongoRepo) EnsureIndexes(ctx context.Context) error {
	_, err := r.DB.Collection("votes").Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "poll_id", Value: 1}, {Key: "user_id", Value: 1}}, Options: options.Index().SetUnique(true)})
	if err != nil {
		return err
	}
	_, err = r.DB.Collection("votes").Indexes().CreateOne(ctx, mongo.IndexModel{Keys: bson.D{{Key: "poll_id", Value: 1}, {Key: "fingerprint", Value: 1}}, Options: options.Index().SetUnique(true)})
	return err
}
func (r *MongoRepo) FindPoll(ctx context.Context, id interface{}) (models.Poll, error) {
	var p models.Poll
	err := r.DB.Collection("polls").FindOne(ctx, bson.M{"_id": id}).Decode(&p)
	return p, err
}
