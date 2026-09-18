package models

import (
    "time"

    "go.mongodb.org/mongo-driver/bson/primitive"
)

type Poll struct {
    ID         primitive.ObjectID `bson:"_id,omitempty" json:"id"`
    OwnerID    primitive.ObjectID `bson:"owner_id" json:"ownerId"`
    Question   string             `bson:"question" json:"question"`
    Options    []string           `bson:"options" json:"options"`
    CreatedAt  primitive.DateTime `bson:"created_at" json:"createdAt"`
    DeadlineAt primitive.DateTime `bson:"deadline_at,omitempty" json:"deadlineAt,omitempty"`
}

func (p Poll) IsClosed() bool {
    if p.DeadlineAt == 0 {
        return false
    }
    return time.Now().After(time.UnixMilli(int64(p.DeadlineAt)).UTC())
}

func (p Poll) Status() string {
    if p.IsClosed() {
        return "Closed"
    }
    return "Active"
}

type PollView struct {
    Poll   `bson:",inline"`
    Counts map[string]int64 `json:"counts"`
}