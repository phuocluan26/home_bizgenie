package services

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"
)

type SlackService struct {
	webhookURL string
}

func NewSlackService(webhookURL string) *SlackService {
	return &SlackService{
		webhookURL: webhookURL,
	}
}

type SlackMessage struct {
	Text        string       `json:"text,omitempty"`
	Blocks     []SlackBlock `json:"blocks,omitempty"`
	Username   string       `json:"username,omitempty"`
	IconEmoji  string       `json:"icon_emoji,omitempty"`
}

type SlackBlock struct {
	Type string       `json:"type"`
	Text *SlackText   `json:"text,omitempty"`
	Fields []SlackField `json:"fields,omitempty"`
}

type SlackText struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

type SlackField struct {
	Type string `json:"type"`
	Text string `json:"text"`
}

func (s *SlackService) SendContactNotification(contact *models.Contact, productName string) error {
	logger.Info("SlackService.SendContactNotification called: ContactID=%d, WebhookURL configured=%v", contact.ID, s.webhookURL != "")
	
	if s.webhookURL == "" {
		logger.Warn("Slack webhook URL is not configured, skipping notification")
		return nil
	}

	logger.Info("Preparing Slack message for contact ID=%d", contact.ID)

	// Format message content
	messageContent := contact.Message
	if contact.Phone != nil && *contact.Phone != "" {
		messageContent = fmt.Sprintf("*Số điện thoại:* %s\n\n%s", *contact.Phone, messageContent)
	}
	if contact.Company != nil && *contact.Company != "" {
		messageContent = fmt.Sprintf("*Công ty:* %s\n\n%s", *contact.Company, messageContent)
	}

	// Build Slack message blocks
	blocks := []SlackBlock{
		{
			Type: "header",
			Text: &SlackText{
				Type: "plain_text",
				Text: "🔔 Liên hệ mới từ website",
			},
		},
		{
			Type: "divider",
		},
		{
			Type: "section",
			Fields: []SlackField{
				{
					Type: "mrkdwn",
					Text: fmt.Sprintf("*Tên:*\n%s", contact.Name),
				},
				{
					Type: "mrkdwn",
					Text: fmt.Sprintf("*Email:*\n%s", contact.Email),
				},
			},
		},
	}

	// Add product if available
	if productName != "" {
		blocks = append(blocks, SlackBlock{
			Type: "section",
			Fields: []SlackField{
				{
					Type: "mrkdwn",
					Text: fmt.Sprintf("*Sản phẩm quan tâm:*\n%s", productName),
				},
			},
		})
	}

	// Add message content
	if messageContent != "" {
		blocks = append(blocks, SlackBlock{
			Type: "section",
			Text: &SlackText{
				Type: "mrkdwn",
				Text: fmt.Sprintf("*Nội dung:*\n%s", messageContent),
			},
		})
	}

	// Add timestamp
	blocks = append(blocks, SlackBlock{
		Type: "context",
		Fields: []SlackField{
			{
				Type: "mrkdwn",
				Text: fmt.Sprintf("📅 %s", contact.CreatedAt.Format("02/01/2006 15:04:05")),
			},
		},
	})

	message := SlackMessage{
		Blocks:    blocks,
		Username:  "BizGenie Bot",
		IconEmoji: ":robot_face:",
	}

	jsonData, err := json.Marshal(message)
	if err != nil {
		logger.ErrorWithErr("Failed to marshal Slack message", err)
		return err
	}

	logger.Info("Sending POST request to Slack webhook: URL=%s, Body size=%d bytes", s.webhookURL, len(jsonData))

	req, err := http.NewRequest("POST", s.webhookURL, bytes.NewBuffer(jsonData))
	if err != nil {
		logger.ErrorWithErr("Failed to create Slack request", err)
		return err
	}

	req.Header.Set("Content-Type", "application/json")

	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	logger.Info("Executing HTTP request to Slack webhook")
	resp, err := client.Do(req)
	if err != nil {
		logger.ErrorWithErr("Failed to send Slack notification", err)
		return err
	}
	defer resp.Body.Close()

	logger.Info("Slack webhook response: Status=%d, StatusCode=%s", resp.StatusCode, resp.Status)

	// Read response body for debugging
	bodyBytes := make([]byte, 1024)
	n, _ := resp.Body.Read(bodyBytes)
	bodyStr := ""
	if n > 0 {
		bodyStr = string(bodyBytes[:n])
		logger.Info("Slack webhook response body: %s", bodyStr)
	}

	if resp.StatusCode != http.StatusOK {
		logger.Error("Slack webhook returned non-200 status: %d, Response body: %s", resp.StatusCode, bodyStr)
		return fmt.Errorf("slack webhook returned status %d: %s", resp.StatusCode, bodyStr)
	}

	logger.Info("Slack notification sent successfully for contact ID: %d", contact.ID)
	return nil
}
