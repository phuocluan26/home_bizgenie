package handlers

import (
	"net/http"
	"strconv"

	"bizgenie-api/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetBlogPosts(c *gin.Context) {
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

	posts, err := h.blogService.GetBlogPosts(status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}

func (h *Handlers) GetBlogPostByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog post ID"})
		return
	}

	post, err := h.blogService.GetBlogPostByID(id)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

func (h *Handlers) GetBlogPostBySlug(c *gin.Context) {
	slug := c.Param("slug")

	post, err := h.blogService.GetBlogPostBySlug(slug)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog post not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

func (h *Handlers) CreateBlogPost(c *gin.Context) {
	var post models.BlogPost
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Set author from JWT context
	userID, exists := c.Get("user_id")
	if exists {
		if uid, ok := userID.(float64); ok {
			post.AuthorID = int(uid)
		}
	}

	if err := h.blogService.CreateBlogPost(&post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": post})
}

func (h *Handlers) UpdateBlogPost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog post ID"})
		return
	}

	var post models.BlogPost
	if err := c.ShouldBindJSON(&post); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.blogService.UpdateBlogPost(id, &post); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": post})
}

func (h *Handlers) DeleteBlogPost(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog post ID"})
		return
	}

	if err := h.blogService.DeleteBlogPost(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog post deleted successfully"})
}

// GetAdminBlogPosts returns all blog posts including draft for admin panel
func (h *Handlers) GetAdminBlogPosts(c *gin.Context) {
	status := c.Query("status") // Optional filter, if empty returns all

	limit := 100 // Default higher limit for admin
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

	posts, err := h.blogService.GetBlogPosts(status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": posts})
}
