package middleware

import "github.com/gin-contrib/cors"

func CORS() cors.Config {
	c := cors.DefaultConfig()
	c.AllowOrigins = []string{
		"http://localhost:5173",
		"https://live-polling-app-eight.vercel.app",
	}
	c.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	c.AllowMethods = []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"}
	return c
}
