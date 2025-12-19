package handlers

import (
	"net/http"

	"bizgenie-api/internal/logger"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) Login(c *gin.Context) {
	logger.Debug("Login request received")
	
	var req struct {
		Username string `json:"username" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Warn("Invalid JSON in Login request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Debug("Login attempt for username: %s", req.Username)

	// Get user by username
	user, err := h.userService.GetUserByUsername(req.Username)
	if err != nil {
		logger.Warn("Login failed: user not found - username: %s", req.Username)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	logger.Debug("User found, checking password for user_id: %d", user.ID)

	// Check password
	if !h.authService.CheckPassword(req.Password, user.PasswordHash) {
		logger.Warn("Login failed: invalid password - username: %s, user_id: %d", req.Username, user.ID)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid credentials"})
		return
	}

	logger.Debug("Password verified, generating token for user_id: %d", user.ID)

	// Generate token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		logger.ErrorWithErr("Failed to generate token for user", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	logger.Info("User logged in successfully - username: %s, user_id: %d", user.Username, user.ID)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}

func (h *Handlers) RefreshToken(c *gin.Context) {
	logger.Debug("Refresh token request received")
	
	// Get user from context (should be set by middleware)
	userID, exists := c.Get("user_id")
	if !exists {
		logger.Warn("Refresh token failed: user_id not found in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	// Get user by ID
	uid, ok := userID.(float64)
	if !ok {
		logger.Warn("Refresh token failed: invalid user_id type in context")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid user ID"})
		return
	}

	logger.Debug("Refreshing token for user_id: %d", int(uid))
	user, err := h.userService.GetUserByID(int(uid))
	if err != nil {
		logger.ErrorWithErr("Refresh token failed: user not found", err)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "User not found"})
		return
	}

	// Generate new token
	token, err := h.authService.GenerateToken(user)
	if err != nil {
		logger.ErrorWithErr("Failed to generate refresh token", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	logger.Info("Token refreshed successfully - user_id: %d", user.ID)

	c.JSON(http.StatusOK, gin.H{
		"token": token,
		"user": gin.H{
			"id":       user.ID,
			"username": user.Username,
			"email":    user.Email,
			"role":     user.Role,
		},
	})
}
