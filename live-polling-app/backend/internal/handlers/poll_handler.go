package handlers

import (
	"live-polling-app/backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
)

type PollHandler struct {
	Service *services.PollService
	Votes   *services.VoteService
}

func (h *PollHandler) Create(c *gin.Context) {
	var in struct {
		Question string   `json:"question"`
		Options  []string `json:"options"`
	}
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(400, gin.H{"error": "invalid request"})
		return
	}
	p, e := h.Service.Create(c, c.MustGet("userID").(primitive.ObjectID), in.Question, in.Options)
	if e != nil {
		c.JSON(400, gin.H{"error": e.Error()})
		return
	}
	c.JSON(http.StatusCreated, p)
}
func (h *PollHandler) Get(c *gin.Context) {
	id, e := primitive.ObjectIDFromHex(c.Param("id"))
	if e != nil {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	p, e := h.Service.Get(c, id)
	if e != nil {
		c.JSON(404, gin.H{"error": "poll not found"})
		return
	}
	counts, _ := h.Votes.Counts(c, p)
	response := gin.H{"poll": p, "counts": counts}
	if userID, ok := c.Get("userID"); ok {
		if uid, ok := userID.(primitive.ObjectID); ok {
			if hasVoted, err := h.Votes.HasUserVoted(c, p.ID, uid); err == nil {
				response["hasVoted"] = hasVoted
			}
		}
	}
	c.JSON(200, response)
}
