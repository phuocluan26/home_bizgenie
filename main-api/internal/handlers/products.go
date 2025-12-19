package handlers

import (
	"database/sql"
	"net/http"
	"strconv"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"

	"github.com/gin-gonic/gin"
)

func (h *Handlers) GetProducts(c *gin.Context) {
	status := c.Query("status")
	if status == "" {
		status = "published"
	}

	categoryIDStr := c.Query("category_id")
	var categoryID *int
	if categoryIDStr != "" {
		id, err := strconv.Atoi(categoryIDStr)
		if err == nil {
			categoryID = &id
		}
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

	products, err := h.productService.GetProducts(status, categoryID, limit, offset)
	if err != nil {
		logger.ErrorWithErr("Failed to get products", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}

func (h *Handlers) GetProductByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	product, err := h.productService.GetProductByID(id)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Debug("Product not found with ID: %d", id)
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		logger.ErrorWithErr("Failed to get product by ID", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *Handlers) GetProductBySlug(c *gin.Context) {
	slug := c.Param("slug")

	product, err := h.productService.GetProductBySlug(slug)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Debug("Product not found with slug: %s", slug)
			c.JSON(http.StatusNotFound, gin.H{"error": "Product not found"})
			return
		}
		logger.ErrorWithErr("Failed to get product by slug", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *Handlers) CreateProduct(c *gin.Context) {
	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		logger.Warn("Invalid JSON in CreateProduct request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productService.CreateProduct(&product); err != nil {
		logger.ErrorWithErr("Failed to create product", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Product created successfully with ID: %d", product.ID)

	c.JSON(http.StatusCreated, gin.H{"data": product})
}

func (h *Handlers) UpdateProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var product models.Product
	if err := c.ShouldBindJSON(&product); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productService.UpdateProduct(id, &product); err != nil {
		logger.ErrorWithErr("Failed to update product", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Product updated successfully with ID: %d", id)

	c.JSON(http.StatusOK, gin.H{"data": product})
}

func (h *Handlers) DeleteProduct(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	if err := h.productService.DeleteProduct(id); err != nil {
		logger.ErrorWithErr("Failed to delete product", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Product deleted successfully with ID: %d", id)

	c.JSON(http.StatusOK, gin.H{"message": "Product deleted successfully"})
}

func (h *Handlers) UpdateProductEmbedding(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid product ID"})
		return
	}

	var req struct {
		Embedding []float32 `json:"embedding"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.productService.UpdateProductEmbedding(id, req.Embedding); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Embedding updated successfully"})
}

// GetAdminProducts returns all products including draft for admin panel
func (h *Handlers) GetAdminProducts(c *gin.Context) {
	status := c.Query("status") // Optional filter, if empty returns all

	categoryIDStr := c.Query("category_id")
	var categoryID *int
	if categoryIDStr != "" {
		id, err := strconv.Atoi(categoryIDStr)
		if err == nil {
			categoryID = &id
		}
	}

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

	products, err := h.productService.GetProducts(status, categoryID, limit, offset)
	if err != nil {
		logger.ErrorWithErr("Failed to get admin products", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": products})
}
