package middleware

import (
	"net/http"
	"runtime/debug"

	"bizgenie-api/internal/logger"

	"github.com/gin-gonic/gin"
)

func ErrorHandler() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Next()

		if len(c.Errors) > 0 {
			err := c.Errors.Last()
			
			// Log error with stack trace in debug mode
			logger.ErrorWithErr("Request error", err.Err)
			
			// Log stack trace in debug mode
			if logger.GetLevel() <= logger.DEBUG {
				stack := debug.Stack()
				logger.Debug("Stack trace:\n%s", string(stack))
			}

			// Get error message
			errMsg := "Internal server error"
			if err.Meta != nil {
				if msg, ok := err.Meta.(string); ok {
					errMsg = msg
				}
			} else if err.Err != nil {
				// In development, show actual error message
				if gin.Mode() == gin.DebugMode {
					errMsg = err.Err.Error()
				}
			}

			c.JSON(http.StatusInternalServerError, gin.H{
				"error": errMsg,
			})
		}
	}
}
