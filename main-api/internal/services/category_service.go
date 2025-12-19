package services

import (
	"database/sql"

	"bizgenie-api/internal/models"
)

type CategoryService struct {
	db *sql.DB
}

func NewCategoryService(db *sql.DB) *CategoryService {
	return &CategoryService{db: db}
}

func (s *CategoryService) GetCategories(parentID *int) ([]models.Category, error) {
	query := `SELECT id, name, slug, description, parent_id, "order", created_at FROM categories`
	var rows *sql.Rows
	var err error

	if parentID != nil {
		query += " WHERE parent_id = $1"
		rows, err = s.db.Query(query+" ORDER BY \"order\", created_at", *parentID)
	} else {
		rows, err = s.db.Query(query + " ORDER BY \"order\", created_at")
	}

	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var categories []models.Category
	for rows.Next() {
		var c models.Category
		err := rows.Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ParentID, &c.Order, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		categories = append(categories, c)
	}

	return categories, nil
}

func (s *CategoryService) GetCategoryByID(id int) (*models.Category, error) {
	query := `SELECT id, name, slug, description, parent_id, "order", created_at FROM categories WHERE id = $1`
	var c models.Category
	err := s.db.QueryRow(query, id).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ParentID, &c.Order, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *CategoryService) GetCategoryBySlug(slug string) (*models.Category, error) {
	query := `SELECT id, name, slug, description, parent_id, "order", created_at FROM categories WHERE slug = $1`
	var c models.Category
	err := s.db.QueryRow(query, slug).Scan(&c.ID, &c.Name, &c.Slug, &c.Description, &c.ParentID, &c.Order, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (s *CategoryService) CreateCategory(c *models.Category) error {
	query := `INSERT INTO categories (name, slug, description, parent_id, "order") VALUES ($1, $2, $3, $4, $5) RETURNING id, created_at`
	err := s.db.QueryRow(query, c.Name, c.Slug, c.Description, c.ParentID, c.Order).Scan(&c.ID, &c.CreatedAt)
	return err
}

func (s *CategoryService) UpdateCategory(id int, c *models.Category) error {
	query := `UPDATE categories SET name = $2, slug = $3, description = $4, parent_id = $5, "order" = $6 WHERE id = $1`
	_, err := s.db.Exec(query, id, c.Name, c.Slug, c.Description, c.ParentID, c.Order)
	return err
}

func (s *CategoryService) DeleteCategory(id int) error {
	query := `DELETE FROM categories WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}
