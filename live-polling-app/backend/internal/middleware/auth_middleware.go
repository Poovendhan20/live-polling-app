package middleware

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"net/http"
	"strings"
)

func Auth(secret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		h := strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer ")
		t, e := jwt.Parse(h, func(t *jwt.Token) (interface{}, error) { return []byte(secret), nil })
		if e != nil || !t.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
			return
		}
		claims := t.Claims.(jwt.MapClaims)
		id, e := primitive.ObjectIDFromHex(claims["sub"].(string))
		if e != nil {
			c.AbortWithStatus(http.StatusUnauthorized)
			return
		}
		c.Set("userID", id)
		c.Next()
	}
}
