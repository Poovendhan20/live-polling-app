package models

import "go.mongodb.org/mongo-driver/bson/primitive"

type User struct {
	ID           primitive.ObjectID `bson:"_id,omitempty" json:"id"`
	Email        string             `bson:"email" json:"email"`
	DisplayName  string             `bson:"display_name,omitempty" json:"displayName"`
	PasswordHash string             `bson:"password_hash" json:"-"`
	CreatedAt    primitive.DateTime `bson:"created_at" json:"createdAt"`
}
