package middleware

import (
	"time"

	"bizgenie-api/internal/logger"

	"github.com/gin-gonic/gin"
)

// RequestLogger logs HTTP requests with method, path, status, and duration
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.Request.URL.Path
		query := c.Request.URL.RawQuery
		method := c.Request.Method
		clientIP := c.ClientIP()

		// Build full path
		fullPath := path
		if query != "" {
			fullPath = path + "?" + query
		}

		// Log incoming request (always log)
		logger.Info("→ %s %s | IP: %s", method, fullPath, clientIP)

		// Process request
		c.Next()

		// Calculate duration
		latency := time.Since(start)
		statusCode := c.Writer.Status()
		userAgent := c.Request.UserAgent()

		// Log based on status code
		if statusCode >= 500 {
			logger.Error("← %s %s | Status: %d | Latency: %v | IP: %s | User-Agent: %s",
				method, fullPath, statusCode, latency, clientIP, userAgent)
		} else if statusCode >= 400 {
			logger.Warn("← %s %s | Status: %d | Latency: %v | IP: %s",
				method, fullPath, statusCode, latency, clientIP)
		} else {
			logger.Info("← %s %s | Status: %d | Latency: %v | IP: %s",
				method, fullPath, statusCode, latency, clientIP)
		}

		// Debug log with more details
		logger.Debug("Request details - Method: %s, Path: %s, Status: %d, Latency: %v, IP: %s, User-Agent: %s",
			method, fullPath, statusCode, latency, clientIP, userAgent)
	}
}
