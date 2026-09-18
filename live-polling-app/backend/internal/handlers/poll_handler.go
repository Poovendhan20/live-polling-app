package handlers

import (
	"errors"
	"live-polling-app/backend/internal/services"
	"log"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/xuri/excelize/v2"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
)

type PollHandler struct {
	Service *services.PollService
	Votes   *services.VoteService
	Users   *mongo.Collection
}

func (h *PollHandler) Create(c *gin.Context) {
	var in struct {
		Question       string   `json:"question"`
		Options        []string `json:"options"`
		DeadlineHours  int      `json:"deadlineHours"`
		CustomDeadline string   `json:"customDeadline"`
	}
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	poll, err := h.Service.Create(c, c.MustGet("userID").(primitive.ObjectID), in.Question, in.Options, in.DeadlineHours, in.CustomDeadline)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusCreated, poll)
}

func totalVotes(counts map[string]int64) int64 {
	var total int64
	for _, count := range counts {
		total += count
	}
	return total
}

func (h *PollHandler) Get(c *gin.Context) {
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return
	}
	poll, err := h.Service.Get(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return
	}
	counts, _ := h.Votes.Counts(c, poll)
	response := gin.H{"poll": poll, "counts": counts, "isClosed": poll.IsClosed(), "status": poll.Status(), "totalVotes": totalVotes(counts)}
	if userID, ok := c.Get("userID"); ok {
		if uid, ok := userID.(primitive.ObjectID); ok {
			if voted, voteErr := h.Votes.HasUserVoted(c, poll.ID, uid); voteErr == nil {
				response["hasVoted"] = voted
			}
		}
	}
	c.JSON(http.StatusOK, response)
}

func (h *PollHandler) My(c *gin.Context) {
	userID, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	polls, err := h.Service.ListByOwner(c, userID.(primitive.ObjectID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to load polls"})
		return
	}
	items := make([]gin.H, 0, len(polls))
	for _, poll := range polls {
		counts, _ := h.Votes.Counts(c, poll)
		items = append(items, gin.H{"poll": poll, "counts": counts, "totalVotes": totalVotes(counts), "status": poll.Status()})
	}
	c.JSON(http.StatusOK, items)
}

func (h *PollHandler) Delete(c *gin.Context) {
	id, ok := h.ownedPoll(c)
	if !ok {
		return
	}
	if err := h.Service.Delete(c, id); err != nil {
		if errors.Is(err, services.ErrPollNotFound) {
			c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
			return
		}
		log.Printf("delete poll %s failed: %v", id.Hex(), err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to delete poll"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"deleted": true, "pollId": id.Hex()})
}

func (h *PollHandler) ownedPoll(c *gin.Context) (primitive.ObjectID, bool) {
	userID, ok := c.Get("userID")
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return primitive.NilObjectID, false
	}
	id, err := primitive.ObjectIDFromHex(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return primitive.NilObjectID, false
	}
	poll, err := h.Service.Get(c, id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
		return primitive.NilObjectID, false
	}
	if poll.OwnerID != userID.(primitive.ObjectID) {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
		return primitive.NilObjectID, false
	}
	return id, true
}

func (h *PollHandler) Analytics(c *gin.Context) {
	id, ok := h.ownedPoll(c)
	if !ok {
		return
	}
	poll, _ := h.Service.Get(c, id)
	counts, _ := h.Votes.Counts(c, poll)
	voterCount, _ := h.Votes.Votes.CountDocuments(c, bson.M{"poll_id": poll.ID})
	c.JSON(http.StatusOK, gin.H{"poll": poll, "counts": counts, "totalVotes": totalVotes(counts), "totalVoters": voterCount, "status": poll.Status()})
}

func (h *PollHandler) Voters(c *gin.Context) {
	id, ok := h.ownedPoll(c)
	if !ok {
		return
	}
	poll, _ := h.Service.Get(c, id)
	cur, err := h.Votes.Votes.Find(c, bson.M{"poll_id": poll.ID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to load voters"})
		return
	}
	defer cur.Close(c)
	voters := []gin.H{}
	for cur.Next(c) {
		var vote struct {
			UserID      primitive.ObjectID `bson:"user_id"`
			VoterName   string             `bson:"voter_name"`
			VoterEmail  string             `bson:"voter_email"`
			OptionIndex int                `bson:"option_index"`
		}
		if cur.Decode(&vote) != nil || vote.OptionIndex < 0 || vote.OptionIndex >= len(poll.Options) {
			continue
		}
		if vote.VoterEmail == "" && h.Users != nil {
			var user struct {
				Email string `bson:"email"`
			}
			if h.Users.FindOne(c, bson.M{"_id": vote.UserID}).Decode(&user) == nil {
				vote.VoterEmail = user.Email
				vote.VoterName = strings.Split(user.Email, "@")[0]
			}
		}
		voters = append(voters, gin.H{"name": vote.VoterName, "email": vote.VoterEmail, "selectedOption": poll.Options[vote.OptionIndex]})
	}
	c.JSON(http.StatusOK, gin.H{"voters": voters})
}

func (h *PollHandler) Report(c *gin.Context) {
	id, ok := h.ownedPoll(c)
	if !ok {
		return
	}
	poll, _ := h.Service.Get(c, id)
	workbook := excelize.NewFile()
	defer workbook.Close()
	sheet := workbook.GetSheetName(0)
	for column, header := range []string{"Name", "Email", "Selected Option"} {
		cell, _ := excelize.CoordinatesToCellName(column+1, 1)
		if err := workbook.SetCellValue(sheet, cell, header); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to generate report"})
			return
		}
	}
	cur, err := h.Votes.Votes.Find(c, bson.M{"poll_id": poll.ID})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to generate report"})
		return
	}
	defer cur.Close(c)
	row := 2
	for cur.Next(c) {
		var vote struct {
			UserID      primitive.ObjectID `bson:"user_id"`
			VoterName   string             `bson:"voter_name"`
			VoterEmail  string             `bson:"voter_email"`
			OptionIndex int                `bson:"option_index"`
		}
		if cur.Decode(&vote) != nil || vote.OptionIndex < 0 || vote.OptionIndex >= len(poll.Options) {
			continue
		}
		if vote.VoterEmail == "" && h.Users != nil {
			var user struct {
				Email string `bson:"email"`
			}
			if h.Users.FindOne(c, bson.M{"_id": vote.UserID}).Decode(&user) == nil {
				vote.VoterEmail = user.Email
				vote.VoterName = strings.Split(user.Email, "@")[0]
			}
		}
		values := []string{vote.VoterName, vote.VoterEmail, poll.Options[vote.OptionIndex]}
		for column, value := range values {
			cell, _ := excelize.CoordinatesToCellName(column+1, row)
			if err := workbook.SetCellValue(sheet, cell, value); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to generate report"})
				return
			}
		}
		row++
	}
	if err := cur.Err(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to generate report"})
		return
	}
	for column, width := range map[string]float64{"A": 24, "B": 34, "C": 24} {
		_ = workbook.SetColWidth(sheet, column, column, width)
	}
	buffer, err := workbook.WriteToBuffer()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to generate report"})
		return
	}
	c.Header("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
	c.Header("Content-Disposition", "attachment; filename=\"LivePoll_Report_"+poll.ID.Hex()+".xlsx\"")
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer.Bytes())
}
