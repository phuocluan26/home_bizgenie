package handlers

import (
	"net/http"
	"strconv"

	"bizgenie-api/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetBlogCategories(c *gin.Context) {
	categories, err := h.blogCategoryService.GetBlogCategories()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": categories})
}

func (h *Handlers) GetBlogCategoryByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog category ID"})
		return
	}

	category, err := h.blogCategoryService.GetBlogCategoryByID(id)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

func (h *Handlers) GetBlogCategoryBySlug(c *gin.Context) {
	slug := c.Param("slug")

	category, err := h.blogCategoryService.GetBlogCategoryBySlug(slug)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Blog category not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

func (h *Handlers) CreateBlogCategory(c *gin.Context) {
	var category models.BlogCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.blogCategoryService.CreateBlogCategory(&category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{"data": category})
}

func (h *Handlers) UpdateBlogCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog category ID"})
		return
	}

	var category models.BlogCategory
	if err := c.ShouldBindJSON(&category); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.blogCategoryService.UpdateBlogCategory(id, &category); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": category})
}

func (h *Handlers) DeleteBlogCategory(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid blog category ID"})
		return
	}

	if err := h.blogCategoryService.DeleteBlogCategory(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Blog category deleted successfully"})
}
