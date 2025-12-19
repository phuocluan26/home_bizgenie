package handlers

import (
	"net/http"
	"strconv"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetSocialMediaLinks(c *gin.Context) {
	activeOnly := c.Query("active_only") == "true"

	links, err := h.socialMediaService.GetSocialMediaLinks(activeOnly)
	if err != nil {
		logger.ErrorWithErr("Failed to get social media links", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": links})
}

func (h *Handlers) GetSocialMediaLinkByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid social media link ID"})
		return
	}

	link, err := h.socialMediaService.GetSocialMediaLinkByID(id)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Social media link not found"})
			return
		}
		logger.ErrorWithErr("Failed to get social media link", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": link})
}

func (h *Handlers) CreateSocialMediaLink(c *gin.Context) {
	var link models.SocialMediaLink
	if err := c.ShouldBindJSON(&link); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.socialMediaService.CreateSocialMediaLink(&link); err != nil {
		logger.ErrorWithErr("Failed to create social media link", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": link})
}

func (h *Handlers) UpdateSocialMediaLink(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid social media link ID"})
		return
	}

	var link models.SocialMediaLink
	if err := c.ShouldBindJSON(&link); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.socialMediaService.UpdateSocialMediaLink(id, &link); err != nil {
		logger.ErrorWithErr("Failed to update social media link", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": link})
}

func (h *Handlers) DeleteSocialMediaLink(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid social media link ID"})
		return
	}

	if err := h.socialMediaService.DeleteSocialMediaLink(id); err != nil {
		logger.ErrorWithErr("Failed to delete social media link", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Social media link deleted successfully"})
}
