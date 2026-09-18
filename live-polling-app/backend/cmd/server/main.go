package main

import (
    "context"
    "live-polling-app/backend/internal/config"
    "live-polling-app/backend/internal/handlers"
    "live-polling-app/backend/internal/middleware"
    "live-polling-app/backend/internal/repository"
    "live-polling-app/backend/internal/routes"
    "live-polling-app/backend/internal/services"
    "live-polling-app/backend/internal/ws"
    "log"
    "time"

    "github.com/gin-contrib/cors"
    "github.com/gin-gonic/gin"
)

func main() {
    cfg := config.Load()
    ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
    defer cancel()
    clients, e := config.Connect(ctx, cfg)
    if e != nil {
        log.Fatal(e)
    }
    mongoRepo := &repository.MongoRepo{DB: clients.DB}
    if e = mongoRepo.EnsureIndexes(ctx); e != nil {
        log.Fatal(e)
    }
    redisRepo := &repository.RedisRepo{Client: clients.Redis}
    auth := &services.AuthService{Users: clients.DB.Collection("users"), Secret: cfg.JWTSecret}
    poll := &services.PollService{Polls: clients.DB.Collection("polls"), Votes: clients.DB.Collection("votes"), Redis: redisRepo}
    vote := &services.VoteService{Polls: clients.DB.Collection("polls"), Votes: clients.DB.Collection("votes"), Redis: redisRepo}
    r := gin.Default()
    r.Use(cors.New(middleware.CORS()))
    routes.Register(r, &handlers.AuthHandler{Service: auth}, &handlers.PollHandler{Service: poll, Votes: vote, Users: clients.DB.Collection("users")}, &handlers.VoteHandler{Polls: poll, Votes: vote}, &handlers.WSHandler{Hub: ws.NewHub(clients.Redis)}, cfg.JWTSecret)
    log.Printf("server listening on :%s", cfg.Port)
    if e = r.Run(":" + cfg.Port); e != nil {
        log.Fatal(e)
    }
}