package services

import (
	"context"
	"testing"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestVoteServiceUserBoundVoteContract(t *testing.T) {
	var _ interface {
		HasUserVoted(context.Context, primitive.ObjectID, primitive.ObjectID) (bool, error)
	} = (*VoteService)(nil)
}
