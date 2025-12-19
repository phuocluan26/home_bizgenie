package services

import (
	"database/sql"
	"fmt"

	"bizgenie-api/internal/logger"
	"bizgenie-api/internal/models"
)

type ProductService struct {
	db *sql.DB
}

func NewProductService(db *sql.DB) *ProductService {
	return &ProductService{db: db}
}

func (s *ProductService) GetProducts(status string, categoryID *int, limit, offset int) ([]models.Product, error) {
	query := `
		SELECT p.id, p.name, p.slug, p.short_description, p.description, 
		       p.category_id, p.image_urls, p.features, p.specifications, 
		       p.status, p.created_at, p.updated_at,
		       c.id, c.name, c.slug, c.description, c.parent_id, c.order, c.created_at
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE 1=1
	`
	args := []interface{}{}
	argPos := 1

	if status != "" {
		query += fmt.Sprintf(" AND p.status = $%d", argPos)
		args = append(args, status)
		argPos++
	}

	if categoryID != nil {
		query += fmt.Sprintf(" AND p.category_id = $%d", argPos)
		args = append(args, *categoryID)
		argPos++
	}

	query += fmt.Sprintf(" ORDER BY p.created_at DESC LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		logger.ErrorWithErr("Failed to query products", err)
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var category models.Category
		var categoryID sql.NullInt64

		err := rows.Scan(
			&p.ID, &p.Name, &p.Slug, &p.ShortDescription, &p.Description,
			&p.CategoryID, &p.ImageURLs, &p.Features, &p.Specifications,
			&p.Status, &p.CreatedAt, &p.UpdatedAt,
			&category.ID, &category.Name, &category.Slug, &category.Description,
			&category.ParentID, &category.Order, &category.CreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if categoryID.Valid {
			p.Category = &category
		}
		products = append(products, p)
	}

	return products, nil
}

func (s *ProductService) GetProductByID(id int) (*models.Product, error) {
	query := `
		SELECT p.id, p.name, p.slug, p.short_description, p.description, 
		       p.category_id, p.image_urls, p.features, p.specifications, 
		       p.status, p.created_at, p.updated_at,
		       c.id, c.name, c.slug, c.description, c.parent_id, c.order, c.created_at
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.id = $1
	`

	var p models.Product
	var category models.Category
	var categoryID sql.NullInt64

	err := s.db.QueryRow(query, id).Scan(
		&p.ID, &p.Name, &p.Slug, &p.ShortDescription, &p.Description,
		&p.CategoryID, &p.ImageURLs, &p.Features, &p.Specifications,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
		&category.ID, &category.Name, &category.Slug, &category.Description,
		&category.ParentID, &category.Order, &category.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if categoryID.Valid {
		p.Category = &category
	}

	return &p, nil
}

func (s *ProductService) GetProductBySlug(slug string) (*models.Product, error) {
	query := `
		SELECT p.id, p.name, p.slug, p.short_description, p.description, 
		       p.category_id, p.image_urls, p.features, p.specifications, 
		       p.status, p.created_at, p.updated_at,
		       c.id, c.name, c.slug, c.description, c.parent_id, c.order, c.created_at
		FROM products p
		LEFT JOIN categories c ON p.category_id = c.id
		WHERE p.slug = $1
	`

	var p models.Product
	var category models.Category
	var categoryID sql.NullInt64

	err := s.db.QueryRow(query, slug).Scan(
		&p.ID, &p.Name, &p.Slug, &p.ShortDescription, &p.Description,
		&p.CategoryID, &p.ImageURLs, &p.Features, &p.Specifications,
		&p.Status, &p.CreatedAt, &p.UpdatedAt,
		&category.ID, &category.Name, &category.Slug, &category.Description,
		&category.ParentID, &category.Order, &category.CreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if categoryID.Valid {
		p.Category = &category
	}

	return &p, nil
}

func (s *ProductService) CreateProduct(p *models.Product) error {
	query := `
		INSERT INTO products (name, slug, short_description, description, category_id, 
		                     image_urls, features, specifications, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	err := s.db.QueryRow(
		query, p.Name, p.Slug, p.ShortDescription, p.Description, p.CategoryID,
		p.ImageURLs, p.Features, p.Specifications, p.Status,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

	return err
}

func (s *ProductService) UpdateProduct(id int, p *models.Product) error {
	query := `
		UPDATE products 
		SET name = $2, slug = $3, short_description = $4, description = $5,
		    category_id = $6, image_urls = $7, features = $8, 
		    specifications = $9, status = $10, updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING updated_at
	`

	err := s.db.QueryRow(
		query, id, p.Name, p.Slug, p.ShortDescription, p.Description,
		p.CategoryID, p.ImageURLs, p.Features, p.Specifications, p.Status,
	).Scan(&p.UpdatedAt)

	return err
}

func (s *ProductService) DeleteProduct(id int) error {
	query := `DELETE FROM products WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}

func (s *ProductService) UpdateProductEmbedding(id int, embedding []float32) error {
	query := `UPDATE products SET embedding = $2 WHERE id = $1`
	_, err := s.db.Exec(query, id, embedding)
	return err
}
