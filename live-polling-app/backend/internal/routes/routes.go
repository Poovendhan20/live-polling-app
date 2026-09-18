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
	r.GET("/api/auth/profile", middleware.Auth(secret), a.Profile)
	r.PATCH("/api/auth/profile", middleware.Auth(secret), a.UpdateProfile)
	r.GET("/api/polls/mine", middleware.Auth(secret), p.My)
	r.GET("/api/polls/:id", middleware.OptionalAuth(secret), p.Get)
	r.GET("/api/polls/:id/voters", middleware.Auth(secret), p.Voters)
	r.GET("/api/polls/:id/analytics", middleware.Auth(secret), p.Analytics)
	r.GET("/api/polls/:id/report", middleware.Auth(secret), p.Report)
	r.POST("/api/polls/:id/votes", middleware.OptionalAuth(secret), v.Vote)
	r.GET("/ws/:id", w.Connect)
	auth := r.Group("/api/polls", middleware.Auth(secret))
	auth.POST("", p.Create)
}
