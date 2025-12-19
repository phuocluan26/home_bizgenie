package config

import (
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL    string
	JWTSecret      string
	Environment    string
	Port           string
	LogLevel       string
	SlackWebhookURL string
}

func Load() (*Config, error) {
	// Load .env file if exists (optional in production)
	_ = godotenv.Load()

	return &Config{
		DatabaseURL:    getEnv("DATABASE_URL", "postgres://postgres:postgres@postgres:5432/bizgenie_db?sslmode=disable"),
		JWTSecret:      getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
		Environment:    getEnv("ENVIRONMENT", "development"),
		Port:           getEnv("PORT", "8080"),
		LogLevel:       getEnv("LOG_LEVEL", "info"),
		SlackWebhookURL: getEnv("SLACK_WEBHOOK_URL", ""),
	}, nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
