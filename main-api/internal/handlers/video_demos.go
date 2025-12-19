package handlers

import (
	"net/http"
	"strconv"

	"bizgenie-api/internal/models"

	"github.com/gin-gonic/gin"
)

// GetVideoDemos returns all video demos (public)
func (h *Handlers) GetVideoDemos(c *gin.Context) {
	status := c.Query("status")
	if status == "" {
		status = "published"
	}

	limit := 20
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	offset := 0
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	demos, err := h.videoDemoService.GetVideoDemos(status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": demos})
}

// GetVideoDemoByID returns a video demo by ID (public)
func (h *Handlers) GetVideoDemoByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid video demo ID"})
		return
	}

	demo, err := h.videoDemoService.GetVideoDemoByID(id)
	if err != nil {
		if err.Error() == "video demo not found" || err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Video demo not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": demo})
}

// GetAdminVideoDemos returns all video demos including draft for admin panel
func (h *Handlers) GetAdminVideoDemos(c *gin.Context) {
	status := c.Query("status") // Can be empty to get all

	limit := 100
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	offset := 0
	if offsetStr := c.Query("offset"); offsetStr != "" {
		if o, err := strconv.Atoi(offsetStr); err == nil && o >= 0 {
			offset = o
		}
	}

	demos, err := h.videoDemoService.GetVideoDemos(status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": demos})
}

// CreateVideoDemo creates a new video demo (admin only)
func (h *Handlers) CreateVideoDemo(c *gin.Context) {
	var demo models.VideoDemo
	if err := c.ShouldBindJSON(&demo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set default values
	if demo.Status == "" {
		demo.Status = "draft"
	}
	if demo.VideoType == "" {
		demo.VideoType = "url"
	}

	if err := h.videoDemoService.CreateVideoDemo(&demo); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": demo})
}

// UpdateVideoDemo updates an existing video demo (admin only)
func (h *Handlers) UpdateVideoDemo(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid video demo ID"})
		return
	}

	var demo models.VideoDemo
	if err := c.ShouldBindJSON(&demo); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.videoDemoService.UpdateVideoDemo(id, &demo); err != nil {
		if err.Error() == "video demo not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Video demo not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": demo})
}

// DeleteVideoDemo deletes a video demo (admin only)
func (h *Handlers) DeleteVideoDemo(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid video demo ID"})
		return
	}

	if err := h.videoDemoService.DeleteVideoDemo(id); err != nil {
		if err.Error() == "video demo not found" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Video demo not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Video demo deleted successfully"})
}
