package handlers

import (
	"live-polling-app/backend/internal/services"
	"net/http"

	"github.com/gin-gonic/gin"

	"go.mongodb.org/mongo-driver/bson/primitive"
)

type AuthHandler struct{ Service *services.AuthService }

func (h *AuthHandler) Signup(c *gin.Context) {
	var in struct{ Email, Password string }
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	token, e := h.Service.Signup(c, in.Email, in.Password)
	if e != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": e.Error()})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"token": token})
}
func (h *AuthHandler) Login(c *gin.Context) {
	var in struct{ Email, Password string }
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	token, e := h.Service.Login(c, in.Email, in.Password)
	if e != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": e.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"token": token})
}

func (h *AuthHandler) Profile(c *gin.Context) {
	userID := c.MustGet("userID").(primitive.ObjectID)
	user, err := h.Service.Profile(c, userID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "account not found"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "email": user.Email, "displayName": user.DisplayName})
}

func (h *AuthHandler) UpdateProfile(c *gin.Context) {
	var in struct {
		DisplayName string `json:"displayName"`
	}
	if c.ShouldBindJSON(&in) != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid request"})
		return
	}
	userID := c.MustGet("userID").(primitive.ObjectID)
	user, err := h.Service.UpdateDisplayName(c, userID, in.DisplayName)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	c.JSON(http.StatusOK, gin.H{"id": user.ID, "email": user.Email, "displayName": user.DisplayName})
}
