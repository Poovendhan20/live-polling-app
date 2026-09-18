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
	userID, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	var in struct {
		OptionIndex int `json:"optionIndex"`
	}
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}
	counts, e := h.Votes.Vote(c, p, in.OptionIndex, userID.(primitive.ObjectID), h.Votes.Fingerprint(id.Hex(), c.ClientIP(), c.GetHeader("User-Agent")))
	if e != nil {
		c.JSON(409, gin.H{"error": e.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"counts": counts, "hasVoted": true})
}
