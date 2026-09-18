package handlers

import (
	"live-polling-app/backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type VoteHandler struct {
	Polls *services.PollService
	Votes *services.VoteService
}

func (h *VoteHandler) Vote(c *gin.Context) {
	id, e := primitive.ObjectIDFromHex(c.Param("id"))
	if e != nil {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	p, e := h.Polls.Get(c, id)
	if e != nil {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	userID := primitive.NilObjectID
	if authenticatedID, ok := c.Get("userID"); ok {
		userID, _ = authenticatedID.(primitive.ObjectID)
	}
	var in struct {
		OptionIndex int    `json:"optionIndex"`
		VoterName   string `json:"voterName"`
		VoterEmail  string `json:"voterEmail"`
	}
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}
	counts, e := h.Votes.Vote(c, p, in.OptionIndex, userID, h.Votes.Fingerprint(id.Hex(), c.ClientIP(), c.GetHeader("User-Agent")), in.VoterName, in.VoterEmail)
	if e != nil {
		c.JSON(409, gin.H{"error": e.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"counts": counts, "hasVoted": true})
}
