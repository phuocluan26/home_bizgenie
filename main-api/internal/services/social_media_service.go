package services

import (
	"database/sql"

	"bizgenie-api/internal/models"
)

type SocialMediaService struct {
	db *sql.DB
}

func NewSocialMediaService(db *sql.DB) *SocialMediaService {
	return &SocialMediaService{db: db}
}

func (s *SocialMediaService) GetSocialMediaLinks(activeOnly bool) ([]models.SocialMediaLink, error) {
	query := `SELECT id, platform, url, icon_name, "order", is_active, created_at, updated_at FROM social_media_links`
	if activeOnly {
		query += " WHERE is_active = true"
	}
	query += " ORDER BY \"order\", created_at"

	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var links []models.SocialMediaLink
	for rows.Next() {
		var link models.SocialMediaLink
		err := rows.Scan(&link.ID, &link.Platform, &link.URL, &link.IconName, &link.Order, &link.IsActive, &link.CreatedAt, &link.UpdatedAt)
		if err != nil {
			return nil, err
		}
		links = append(links, link)
	}

	return links, nil
}

func (s *SocialMediaService) GetSocialMediaLinkByID(id int) (*models.SocialMediaLink, error) {
	query := `SELECT id, platform, url, icon_name, "order", is_active, created_at, updated_at FROM social_media_links WHERE id = $1`
	var link models.SocialMediaLink
	err := s.db.QueryRow(query, id).Scan(&link.ID, &link.Platform, &link.URL, &link.IconName, &link.Order, &link.IsActive, &link.CreatedAt, &link.UpdatedAt)
	if err != nil {
		return nil, err
	}
	return &link, nil
}

func (s *SocialMediaService) CreateSocialMediaLink(link *models.SocialMediaLink) error {
	query := `INSERT INTO social_media_links (platform, url, icon_name, "order", is_active) VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at, updated_at`
	err := s.db.QueryRow(query, link.Platform, link.URL, link.IconName, link.Order, link.IsActive).Scan(&link.ID, &link.CreatedAt, &link.UpdatedAt)
	return err
}

func (s *SocialMediaService) UpdateSocialMediaLink(id int, link *models.SocialMediaLink) error {
	query := `UPDATE social_media_links SET platform = $2, url = $3, icon_name = $4, "order" = $5, is_active = $6, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING updated_at`
	err := s.db.QueryRow(query, id, link.Platform, link.URL, link.IconName, link.Order, link.IsActive).Scan(&link.UpdatedAt)
	return err
}

func (s *SocialMediaService) DeleteSocialMediaLink(id int) error {
	query := `DELETE FROM social_media_links WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}
