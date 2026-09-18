package middleware

import "github.com/gin-contrib/cors"

func CORS() cors.Config {
	c := cors.DefaultConfig()
	c.AllowOrigins = []string{"http://localhost:5173"}
	c.AllowHeaders = []string{"Origin", "Content-Type", "Authorization"}
	c.AllowMethods = []string{"GET", "POST", "OPTIONS"}
	return c
}
