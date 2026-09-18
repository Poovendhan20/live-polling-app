package services

import (
	"testing"
	"time"

	"live-polling-app/backend/internal/models"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

func TestPollStatusDeadlineHelpers(t *testing.T) {
	now := time.Now()

	t.Run("active poll remains open", func(t *testing.T) {
		deadline := now.Add(2 * time.Hour)
		p := models.Poll{DeadlineAt: primitive.NewDateTimeFromTime(deadline)}
		if p.IsClosed() {
			t.Fatal("expected active poll to remain open")
		}
	})

	t.Run("expired poll closes automatically", func(t *testing.T) {
		deadline := now.Add(-1 * time.Hour)
		p := models.Poll{DeadlineAt: primitive.NewDateTimeFromTime(deadline)}
		if !p.IsClosed() {
			t.Fatal("expected expired poll to be closed")
		}
	})
}
