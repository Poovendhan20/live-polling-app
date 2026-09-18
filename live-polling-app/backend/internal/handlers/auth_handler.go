package handlers

import (
	"github.com/gin-gonic/gin"
	"live-polling-app/backend/internal/services"
	"net/http"
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
