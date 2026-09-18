package routes

import (
	"live-polling-app/backend/internal/handlers"
	"live-polling-app/backend/internal/middleware"

	"github.com/gin-gonic/gin"
)

func Register(r *gin.Engine, a *handlers.AuthHandler, p *handlers.PollHandler, v *handlers.VoteHandler, w *handlers.WSHandler, secret string) {
	r.GET("/health", func(c *gin.Context) { c.JSON(200, gin.H{"status": "ok"}) })
	r.POST("/api/auth/signup", a.Signup)
	r.POST("/api/auth/login", a.Login)
	r.GET("/api/polls/:id", middleware.OptionalAuth(secret), p.Get)
	r.POST("/api/polls/:id/votes", middleware.Auth(secret), v.Vote)
	r.GET("/ws/:id", w.Connect)
	auth := r.Group("/api/polls", middleware.Auth(secret))
	auth.POST("", p.Create)
}
