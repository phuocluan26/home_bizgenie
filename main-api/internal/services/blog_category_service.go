package services

import (
	"database/sql"

	"bizgenie-api/internal/models"
)

type BlogCategoryService struct {
	db *sql.DB
}

func NewBlogCategoryService(db *sql.DB) *BlogCategoryService {
	return &BlogCategoryService{db: db}
}

func (s *BlogCategoryService) GetBlogCategories() ([]models.BlogCategory, error) {
	query := `SELECT id, name, slug, description, "order", created_at FROM blog_categories ORDER BY "order", created_at`
	rows, err := s.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.BlogCategory
	for rows.Next() {
		var c models.BlogCategory
		err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Order, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}

	return categories, nil
}

func (s *BlogCategoryService) GetBlogCategoryByID(id int) (*models.BlogCategory, error) {
	query := `SELECT id, name, slug, description, "order", created_at FROM blog_categories WHERE id = $1`
	var c models.BlogCategory
	err := s.db.QueryRow(query, id).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Order, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *BlogCategoryService) GetBlogCategoryBySlug(slug string) (*models.BlogCategory, error) {
	query := `SELECT id, name, slug, description, "order", created_at FROM blog_categories WHERE slug = $1`
	var c models.BlogCategory
	err := s.db.QueryRow(query, slug).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.Order, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *BlogCategoryService) CreateBlogCategory(c *models.BlogCategory) error {
	query := `INSERT INTO blog_categories (name, slug, description, "order") VALUES ($1, $2, $3, $4) RETURNING id, created_at`
	err := s.db.QueryRow(query, c.Name, c.Slug, c.Description, c.Order).Scan(&c.ID, &c.CreatedAt)
	return err
}

func (s *BlogCategoryService) UpdateBlogCategory(id int, c *models.BlogCategory) error {
	query := `UPDATE blog_categories SET name = $2, slug = $3, description = $4, "order" = $5 WHERE id = $1`
	_, err := s.db.Exec(query, id, c.Name, c.Slug, c.Description, c.Order)
	return err
}

func (s *BlogCategoryService) DeleteBlogCategory(id int) error {
	query := `DELETE FROM blog_categories WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}
