package handlers

import (
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"live-polling-app/backend/internal/services"
	"net/http"
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
	c.JSON(200, gin.H{"poll": p, "counts": counts})
}
