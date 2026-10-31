package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port             string
	DatabaseURL      string
	JWTSecret        string
	CORSOrigin       string
	Environment      string
	TelegramBotToken string
	TelegramChatID   string
}

const DefaultJWTSecret = "ncd-super-secure-default-jwt-secret-key-change-in-prod"

func Load() *Config {
	_ = godotenv.Load()

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/ncd?sslmode=disable"
	}

	env := os.Getenv("APP_ENV")
	if env == "" {
		env = "development"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if env == "production" {
		if jwtSecret == "" || jwtSecret == DefaultJWTSecret || len(jwtSecret) < 32 {
			log.Fatal("FATAL SECURITY ERROR: JWT_SECRET environment variable must be set to a secure, random string (>= 32 characters) in production")
		}
	} else if jwtSecret == "" {
		jwtSecret = DefaultJWTSecret
	}

	corsOrigin := os.Getenv("CORS_ORIGIN")
	if corsOrigin == "" {
		corsOrigin = "http://localhost:5173"
	}

	telegramBotToken := os.Getenv("TELEGRAM_BOT_TOKEN")
	telegramChatID := os.Getenv("TELEGRAM_CHAT_ID")

	return &Config{
		Port:             port,
		DatabaseURL:      dbURL,
		JWTSecret:        jwtSecret,
		CORSOrigin:       corsOrigin,
		Environment:      env,
		TelegramBotToken: telegramBotToken,
		TelegramChatID:   telegramChatID,
	}
}
