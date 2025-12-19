package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"

	"github.com/gin-gonic/gin"
)

type CreateContactRequest struct {
	Name    string  `json:"name" binding:"required"`
	Email   string  `json:"email" binding:"required"`
	Phone   *string `json:"phone,omitempty"`
	Company *string `json:"company,omitempty"`
	Product string  `json:"product,omitempty"` // "all" or product ID
	Needs   string  `json:"needs,omitempty"`
	Notes   string  `json:"notes,omitempty"`
}

func (h *Handlers) CreateContact(c *gin.Context) {
	var req CreateContactRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		logger.Error("Failed to bind contact request: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Received contact request: Name=%s, Email=%s, Product=%s", req.Name, req.Email, req.Product)

	// Build message from needs and notes
	var messageParts []string
	if req.Needs != "" {
		messageParts = append(messageParts, fmt.Sprintf("Nhu cầu: %s", req.Needs))
	}
	if req.Notes != "" {
		messageParts = append(messageParts, fmt.Sprintf("Ghi chú: %s", req.Notes))
	}
	
	message := strings.Join(messageParts, "\n\n")
	if message == "" {
		message = "Khách hàng đã gửi liên hệ"
	}

	contact := models.Contact{
		Name:    req.Name,
		Email:   req.Email,
		Phone:   req.Phone,
		Company: req.Company,
		Message: message,
		Status:  "new",
	}

	if err := h.contactService.CreateContact(&contact); err != nil {
		logger.ErrorWithErr("Failed to create contact", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	logger.Info("Contact created successfully: ID=%d, Name=%s, Email=%s", contact.ID, contact.Name, contact.Email)

	// Get product name if product ID is provided
	productName := ""
	if req.Product != "" && req.Product != "all" {
		productID, err := strconv.Atoi(req.Product)
		if err == nil {
			product, err := h.productService.GetProductByID(productID)
			if err == nil && product != nil {
				productName = product.Name
				logger.Info("Found product: ID=%d, Name=%s", productID, productName)
			} else {
				logger.Warn("Product not found: ID=%d, Error=%v", productID, err)
			}
		} else {
			logger.Warn("Invalid product ID format: %s", req.Product)
		}
	} else if req.Product == "all" {
		productName = "Tất cả sản phẩm"
	}

	// Send Slack notification (non-blocking, log error if fails)
	logger.Info("Sending Slack notification for contact ID=%d, Product=%s", contact.ID, productName)
	go func() {
		if err := h.slackService.SendContactNotification(&contact, productName); err != nil {
			logger.ErrorWithErr("Failed to send Slack notification", err)
		} else {
			logger.Info("Slack notification sent successfully for contact ID=%d", contact.ID)
		}
	}()

	c.JSON(http.StatusCreated, gin.H{"data": contact})
}

func (h *Handlers) GetContacts(c *gin.Context) {
	status := c.Query("status")

	limit := 50
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

	contacts, err := h.contactService.GetContacts(status, limit, offset)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": contacts})
}

func (h *Handlers) GetContactByID(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contact ID"})
		return
	}

	contact, err := h.contactService.GetContactByID(id)
	if err != nil {
		if err.Error() == "sql: no rows in result set" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Contact not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": contact})
}

func (h *Handlers) UpdateContactStatus(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contact ID"})
		return
	}

	var req struct {
		Status string `json:"status"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	if err := h.contactService.UpdateContactStatus(id, req.Status); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact status updated successfully"})
}

func (h *Handlers) DeleteContact(c *gin.Context) {
	id, err := strconv.Atoi(c.Param("id"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid contact ID"})
		return
	}

	if err := h.contactService.DeleteContact(id); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Contact deleted successfully"})
}
