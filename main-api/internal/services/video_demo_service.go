package services

import (
	"database/sql"
	"fmt"
	"regexp"
	"strings"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"
)

type VideoDemoService struct {
	db *sql.DB
}

func NewVideoDemoService(db *sql.DB) *VideoDemoService {
	return &VideoDemoService{db: db}
}

// ExtractYouTubeID extracts YouTube video ID from various YouTube URL formats
// Supports regular YouTube videos and YouTube Shorts
func ExtractYouTubeID(url string) (string, error) {
	patterns := []string{
		`youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})`, // YouTube Shorts format
		`(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})`,
		`youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})`,
	}
	
	for _, pattern := range patterns {
		re := regexp.MustCompile(pattern)
		matches := re.FindStringSubmatch(url)
		if len(matches) > 1 {
			return matches[1], nil
		}
	}
	
	return "", fmt.Errorf("invalid YouTube URL")
}

// GetVideoDemos returns all video demos with optional status filter
func (s *VideoDemoService) GetVideoDemos(status string, limit, offset int) ([]models.VideoDemo, error) {
	query := `
		SELECT id, title, description, video_url, video_type, youtube_id, 
		       thumbnail_url, status, "order", created_at, updated_at
		FROM video_demos
		WHERE 1=1
	`
	args := []interface{}{}
	argPos := 1

	if status != "" {
		query += fmt.Sprintf(" AND status = $%d", argPos)
		args = append(args, status)
		argPos++
	}

	query += fmt.Sprintf(" ORDER BY \"order\" ASC, created_at DESC LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		logger.ErrorWithErr("Failed to query video demos", err)
		return nil, err
	}
	defer rows.Close()

	var demos []models.VideoDemo
	for rows.Next() {
		var d models.VideoDemo
		var description sql.NullString
		var youtubeID sql.NullString
		var thumbnailURL sql.NullString

		err := rows.Scan(
			&d.ID, &d.Title, &description, &d.VideoURL, &d.VideoType, &youtubeID,
			&thumbnailURL, &d.Status, &d.Order, &d.CreatedAt, &d.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		if description.Valid {
			d.Description = &description.String
		}
		if youtubeID.Valid {
			d.YouTubeID = &youtubeID.String
		}
		if thumbnailURL.Valid {
			d.ThumbnailURL = &thumbnailURL.String
		}

		demos = append(demos, d)
	}

	return demos, nil
}

// GetVideoDemoByID returns a video demo by ID
func (s *VideoDemoService) GetVideoDemoByID(id int) (*models.VideoDemo, error) {
	query := `
		SELECT id, title, description, video_url, video_type, youtube_id, 
		       thumbnail_url, status, "order", created_at, updated_at
		FROM video_demos
		WHERE id = $1
	`

	var d models.VideoDemo
	var description sql.NullString
	var youtubeID sql.NullString
	var thumbnailURL sql.NullString

	err := s.db.QueryRow(query, id).Scan(
		&d.ID, &d.Title, &description, &d.VideoURL, &d.VideoType, &youtubeID,
		&thumbnailURL, &d.Status, &d.Order, &d.CreatedAt, &d.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("video demo not found")
		}
		logger.ErrorWithErr("Failed to get video demo by ID", err)
		return nil, err
	}

	if description.Valid {
		d.Description = &description.String
	}
	if youtubeID.Valid {
		d.YouTubeID = &youtubeID.String
	}
	if thumbnailURL.Valid {
		d.ThumbnailURL = &thumbnailURL.String
	}

	return &d, nil
}

// CreateVideoDemo creates a new video demo
func (s *VideoDemoService) CreateVideoDemo(demo *models.VideoDemo) error {
	// Auto-detect video type if not specified
	if demo.VideoType == "" {
		if strings.Contains(demo.VideoURL, "youtube.com") || strings.Contains(demo.VideoURL, "youtu.be") {
			demo.VideoType = "youtube"
			// Extract YouTube ID
			if youtubeID, err := ExtractYouTubeID(demo.VideoURL); err == nil {
				demo.YouTubeID = &youtubeID
				// Generate thumbnail URL
				thumbnail := fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", youtubeID)
				demo.ThumbnailURL = &thumbnail
			}
		} else {
			demo.VideoType = "url"
		}
	} else if demo.VideoType == "youtube" && demo.YouTubeID == nil {
		// Extract YouTube ID if video type is youtube but ID is missing
		if youtubeID, err := ExtractYouTubeID(demo.VideoURL); err == nil {
			demo.YouTubeID = &youtubeID
			// Generate thumbnail URL
			thumbnail := fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", youtubeID)
			demo.ThumbnailURL = &thumbnail
		}
	}

	query := `
		INSERT INTO video_demos (title, description, video_url, video_type, youtube_id, thumbnail_url, status, "order")
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRow(
		query,
		demo.Title,
		demo.Description,
		demo.VideoURL,
		demo.VideoType,
		demo.YouTubeID,
		demo.ThumbnailURL,
		demo.Status,
		demo.Order,
	).Scan(&demo.ID, &demo.CreatedAt, &demo.UpdatedAt)

	if err != nil {
		logger.ErrorWithErr("Failed to create video demo", err)
		return err
	}

	return nil
}

// UpdateVideoDemo updates an existing video demo
func (s *VideoDemoService) UpdateVideoDemo(id int, demo *models.VideoDemo) error {
	// Auto-detect video type if not specified
	if demo.VideoType == "" {
		if strings.Contains(demo.VideoURL, "youtube.com") || strings.Contains(demo.VideoURL, "youtu.be") {
			demo.VideoType = "youtube"
			// Extract YouTube ID
			if youtubeID, err := ExtractYouTubeID(demo.VideoURL); err == nil {
				demo.YouTubeID = &youtubeID
				// Generate thumbnail URL
				thumbnail := fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", youtubeID)
				demo.ThumbnailURL = &thumbnail
			}
		} else {
			demo.VideoType = "url"
		}
	} else if demo.VideoType == "youtube" && demo.YouTubeID == nil {
		// Extract YouTube ID if video type is youtube but ID is missing
		if youtubeID, err := ExtractYouTubeID(demo.VideoURL); err == nil {
			demo.YouTubeID = &youtubeID
			// Generate thumbnail URL
			thumbnail := fmt.Sprintf("https://img.youtube.com/vi/%s/maxresdefault.jpg", youtubeID)
			demo.ThumbnailURL = &thumbnail
		}
	}

	query := `
		UPDATE video_demos
		SET title = $1, description = $2, video_url = $3, video_type = $4, 
		    youtube_id = $5, thumbnail_url = $6, status = $7, "order" = $8, updated_at = CURRENT_TIMESTAMP
		WHERE id = $9
		RETURNING updated_at
	`

	err := s.db.QueryRow(
		query,
		demo.Title,
		demo.Description,
		demo.VideoURL,
		demo.VideoType,
		demo.YouTubeID,
		demo.ThumbnailURL,
		demo.Status,
		demo.Order,
		id,
	).Scan(&demo.UpdatedAt)

	if err != nil {
		if err == sql.ErrNoRows {
			return fmt.Errorf("video demo not found")
		}
		logger.ErrorWithErr("Failed to update video demo", err)
		return err
	}

	return nil
}

// DeleteVideoDemo deletes a video demo
func (s *VideoDemoService) DeleteVideoDemo(id int) error {
	query := `DELETE FROM video_demos WHERE id = $1`
	result, err := s.db.Exec(query, id)
	if err != nil {
		logger.ErrorWithErr("Failed to delete video demo", err)
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return fmt.Errorf("video demo not found")
	}

	return nil
}
