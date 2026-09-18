package handlers

import (
    "fmt"
    "live-polling-app/backend/internal/services"
    "net/http"
    "strconv"
    "strings"
    "time"

    "github.com/gin-gonic/gin"
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
        c.JSON(400, gin.H{"error": "invalid request"})
        return
    }
    p, e := h.Service.Create(c, c.MustGet("userID").(primitive.ObjectID), in.Question, in.Options, in.DeadlineHours, in.CustomDeadline)
    if e != nil {
        c.JSON(400, gin.H{"error": e.Error()})
        return
    }
    c.JSON(http.StatusCreated, p)
}

func totalVotes(counts map[string]int64) int64 {
    var total int64
    for _, value := range counts {
        total += value
    }
    return total
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
    response := gin.H{"poll": p, "counts": counts, "isClosed": p.IsClosed(), "status": p.Status(), "totalVotes": totalVotes(counts)}
    if userID, ok := c.Get("userID"); ok {
        if uid, ok := userID.(primitive.ObjectID); ok {
            if hasVoted, err := h.Votes.HasUserVoted(c, p.ID, uid); err == nil {
                response["hasVoted"] = hasVoted
            }
        }
    }
    c.JSON(200, response)
}

func (h *PollHandler) My(c *gin.Context) {
    userID, ok := c.Get("userID")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    polls, e := h.Service.ListByOwner(c, userID.(primitive.ObjectID))
    if e != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to load polls"})
        return
    }
    c.JSON(http.StatusOK, polls)
}

func (h *PollHandler) Voters(c *gin.Context) {
    userID, ok := c.Get("userID")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    id, err := primitive.ObjectIDFromHex(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
        return
    }
    p, err := h.Service.Get(c, id)
    if err != nil || p.OwnerID != userID.(primitive.ObjectID) {
        c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
        return
    }
    cur, err := h.Votes.Votes.Find(c, bson.M{"poll_id": p.ID})
    if err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "unable to load voters"})
        return
    }
    defer cur.Close(c)
    voters := []gin.H{}
    for cur.Next(c) {
        var v struct {
            UserID      primitive.ObjectID `bson:"user_id"`
            OptionIndex int                `bson:"option_index"`
        }
        if err := cur.Decode(&v); err != nil {
            continue
        }
        var user struct { Email string `bson:"email"` }
        if err := h.Users.FindOne(c, bson.M{"_id": v.UserID}).Decode(&user); err == nil {
            voters = append(voters, gin.H{"name": strings.Split(user.Email, "@")[0], "email": user.Email, "selectedOption": p.Options[v.OptionIndex], "optionIndex": v.OptionIndex})
        }
    }
    c.JSON(http.StatusOK, gin.H{"pollId": p.ID.Hex(), "question": p.Question, "totalVoters": len(voters), "voters": voters})
}

func (h *PollHandler) Report(c *gin.Context) {
    userID, ok := c.Get("userID")
    if !ok {
        c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
        return
    }
    id, err := primitive.ObjectIDFromHex(c.Param("id"))
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "poll not found"})
        return
    }
    p, err := h.Service.Get(c, id)
    if err != nil || p.OwnerID != userID.(primitive.ObjectID) {
        c.JSON(http.StatusForbidden, gin.H{"error": "forbidden"})
        return
    }
    counts, _ := h.Votes.Counts(c, p)
    total := totalVotes(counts)
    lines := []string{"Poll Question," + p.Question, "Poll ID," + p.ID.Hex(), "Status," + p.Status(), "Total Votes," + strconv.FormatInt(total, 10), "Deadline," + func() string {
        if p.DeadlineAt == 0 { return "No deadline" }
        return time.UnixMilli(int64(p.DeadlineAt)).UTC().Format(time.RFC3339)
    }(), "", "Option,Votes,Percentage"}
    for idx, option := range p.Options {
        count := counts[strconv.Itoa(idx)]
        percentage := 0.0
        if total > 0 {
            percentage = float64(count) / float64(total) * 100
        }
        lines = append(lines, fmt.Sprintf("%s,%d,%.2f", option, count, percentage))
    }
    lines = append(lines, "", "Name,Email,Selected Option")
    cur, err := h.Votes.Votes.Find(c, bson.M{"poll_id": p.ID})
    if err == nil {
        defer cur.Close(c)
        for cur.Next(c) {
            var v struct {
                UserID      primitive.ObjectID `bson:"user_id"`
                OptionIndex int                `bson:"option_index"`
            }
            if cur.Decode(&v) != nil { continue }
            var user struct { Email string `bson:"email"` }
            if h.Users.FindOne(c, bson.M{"_id": v.UserID}).Decode(&user) == nil {
                lines = append(lines, fmt.Sprintf("%s,%s,%s", strings.Split(user.Email, "@")[0], user.Email, p.Options[v.OptionIndex]))
            }
        }
    }
    c.Header("Content-Type", "text/csv")
    c.Header("Content-Disposition", "attachment; filename=\"poll-report.csv\"")
    c.String(http.StatusOK, strings.Join(lines, "\n"))
}