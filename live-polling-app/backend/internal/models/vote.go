package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type Vote struct {
	ID          primitive.ObjectID `bson:"_id,omitempty"`
	PollID      primitive.ObjectID `bson:"poll_id"`
	UserID      primitive.ObjectID `bson:"user_id"`
	OptionIndex int                `bson:"option_index"`
	Fingerprint string             `bson:"fingerprint"`
	CreatedAt   primitive.DateTime `bson:"created_at"`
}
