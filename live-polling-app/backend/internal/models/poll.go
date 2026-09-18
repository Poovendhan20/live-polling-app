package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Poll struct {
	ID        primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	OwnerID   primitive.ObjectID `bson:"owner_id" json:"ownerId"`
	Question  string             `bson:"question" json:"question"`
	Options   []string           `bson:"options" json:"options"`
	CreatedAt primitive.DateTime `bson:"created_at" json:"createdAt"`
}
type PollView struct {
	Poll   `bson:",inline"`
	Counts map[string]int64 `json:"counts"`
}
