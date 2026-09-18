package services

import (
	"context"
	"errors"
	"live-polling-app/backend/internal/models"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/bson/primitive"
	"go.mongodb.org/mongo-driver/mongo"
	"golang.org/x/crypto/bcrypt"
)

type AuthService struct {
	Users  *mongo.Collection
	Secret string
}

func (s *AuthService) Profile(ctx context.Context, userID primitive.ObjectID) (models.User, error) {
	var user models.User
	err := s.Users.FindOne(ctx, bson.M{"_id": userID}).Decode(&user)
	if user.DisplayName == "" {
		user.DisplayName = "Poovendhan R"
	}
	return user, err
}

func (s *AuthService) UpdateDisplayName(ctx context.Context, userID primitive.ObjectID, displayName string) (models.User, error) {
	displayName = strings.TrimSpace(displayName)
	if displayName == "" {
		return models.User{}, errors.New("profile name cannot be empty")
	}
	_, err := s.Users.UpdateOne(ctx, bson.M{"_id": userID}, bson.M{"$set": bson.M{"display_name": displayName}})
	if err != nil {
		return models.User{}, err
	}
	return s.Profile(ctx, userID)
}

func (s *AuthService) Signup(ctx context.Context, email, password string) (string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if !strings.Contains(email, "@") || !validPassword(password) {
		return "", errors.New("valid email and a medium or strong password are required")
	}
	hash, e := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if e != nil {
		return "", e
	}
	u := models.User{ID: primitive.NewObjectID(), Email: email, PasswordHash: string(hash), CreatedAt: primitive.NewDateTimeFromTime(time.Now())}
	if _, e = s.Users.InsertOne(ctx, u); e != nil {
		return "", errors.New("email already registered")
	}
	return s.token(u.ID.Hex(), u.Email)
}
func (s *AuthService) Login(ctx context.Context, email, password string) (string, error) {
	var u models.User
	if e := s.Users.FindOne(ctx, bson.M{"email": strings.ToLower(strings.TrimSpace(email))}).Decode(&u); e != nil {
		return "", errors.New("invalid credentials")
	}
	if bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password)) != nil {
		return "", errors.New("invalid credentials")
	}
	return s.token(u.ID.Hex(), u.Email)
}
func (s *AuthService) token(id, email string) (string, error) {
	return jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{"sub": id, "email": email, "exp": time.Now().Add(24 * time.Hour).Unix()}).SignedString([]byte(s.Secret))
}
func validPassword(password string) bool {
	upper, lower, number, symbol := false, false, false, false
	for _, char := range password {
		switch {
		case char >= 'A' && char <= 'Z':
			upper = true
		case char >= 'a' && char <= 'z':
			lower = true
		case char >= '0' && char <= '9':
			number = true
		default:
			symbol = true
		}
	}
	groups := 0
	for _, present := range []bool{upper, lower, number, symbol} {
		if present {
			groups++
		}
	}
	return len(password) >= 8 && groups >= 2
}
