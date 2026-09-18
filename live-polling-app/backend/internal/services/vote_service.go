package services

import (
    "context"
    "crypto/sha256"
    "encoding/hex"
    "errors"
    "fmt"
    "live-polling-app/backend/internal/models"
    "live-polling-app/backend/internal/repository"
    "time"

    "go.mongodb.org/mongo-driver/bson"
    "go.mongodb.org/mongo-driver/bson/primitive"
    "go.mongodb.org/mongo-driver/mongo"
)

type VoteService struct {
    Polls, Votes *mongo.Collection
    Redis        *repository.RedisRepo
}

func (s *VoteService) Fingerprint(pollID, ip, agent string) string {
    h := sha256.Sum256([]byte(pollID + "|" + ip + "|" + agent))
    return hex.EncodeToString(h[:])
}

func (s *VoteService) HasUserVoted(ctx context.Context, pollID, userID primitive.ObjectID) (bool, error) {
    count, err := s.Votes.CountDocuments(ctx, bson.M{"poll_id": pollID, "user_id": userID})
    return count > 0, err
}

func (s *VoteService) PollClosed(poll models.Poll) bool {
    return poll.IsClosed()
}

func (s *VoteService) Vote(ctx context.Context, poll models.Poll, index int, userID primitive.ObjectID, fp string) (map[string]int64, error) {
    if userID.IsZero() {
        return nil, errors.New("authentication required")
    }
    if poll.IsClosed() {
        return nil, errors.New("this poll has ended")
    }
    if index < 0 || index >= len(poll.Options) {
        return nil, errors.New("invalid option")
    }
    if has, e := s.HasUserVoted(ctx, poll.ID, userID); e != nil {
        return nil, e
    } else if has {
        return nil, errors.New("you have already voted on this poll")
    }
    v := models.Vote{ID: primitive.NewObjectID(), PollID: poll.ID, UserID: userID, OptionIndex: index, Fingerprint: fp, CreatedAt: primitive.NewDateTimeFromTime(time.Now())}
    if _, e := s.Votes.InsertOne(ctx, v); e != nil {
        return nil, errors.New("you have already voted on this poll")
    }
    return s.Redis.Increment(ctx, poll.ID.Hex(), index)
}

func (s *VoteService) Counts(ctx context.Context, poll models.Poll) (map[string]int64, error) {
    counts, e := s.Redis.Counts(ctx, poll.ID.Hex())
    if e != nil {
        return nil, e
    }
    if len(counts) > 0 {
        return counts, nil
    }
    cur, e := s.Votes.Find(ctx, bson.M{"poll_id": poll.ID})
    if e != nil {
        return nil, e
    }
    defer cur.Close(ctx)
    counts = map[string]int64{}
    for cur.Next(ctx) {
        var v models.Vote
        if cur.Decode(&v) == nil {
            counts[fmt.Sprint(v.OptionIndex)]++
        }
    }
    for key, value := range counts {
        s.Redis.Client.HSet(ctx, s.Redis.Key(poll.ID.Hex()), key, value)
    }
    return counts, nil
}