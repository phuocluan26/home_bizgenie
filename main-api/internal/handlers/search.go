package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) SearchProducts(c *gin.Context) {
	// Get query parameters
	query := c.Query("q")
	embeddingStr := c.Query("embedding")

	limit := 10
	if limitStr := c.Query("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	// If embedding is provided, use semantic search
	if embeddingStr != "" {
		// Parse embedding from query string (would need proper parsing)
		// For now, use text search as fallback
		// threshold would be used for semantic search: threshold := 0.7
		products, err := h.searchService.SearchProductsByText(query, limit)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		c.JSON(http.StatusOK, gin.H{"data": products})
		return
	}

	// Use text search
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	products, err := h.searchService.SearchProductsByText(query, limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}
