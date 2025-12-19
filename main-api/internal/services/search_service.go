package services

import (
	"database/sql"
	"fmt"

	"bizgenie-api/internal/models"

	"github.com/pgvector/pgvector-go"
)

type SearchService struct {
	db *sql.DB
}

func NewSearchService(db *sql.DB) *SearchService {
	return &SearchService{db: db}
}

// SearchProducts performs semantic search using pgvector
func (s *SearchService) SearchProducts(queryEmbedding []float32, limit int, threshold float64) ([]models.Product, error) {
	if len(queryEmbedding) == 0 {
		return nil, fmt.Errorf("query embedding is required")
	}

	vector := pgvector.NewVector(queryEmbedding)

	// Use cosine similarity for semantic search
	query := `
		SELECT p.id, p.name, p.slug, p.short_description, p.description, 
		       p.category_id, p.image_urls, p.features, p.specifications, 
		       p.status, p.created_at, p.updated_at,
		       1 - (p.embedding <=> $1::vector) as similarity
		FROM products p
		WHERE p.embedding IS NOT NULL 
		  AND p.status = 'published'
		  AND 1 - (p.embedding <=> $1::vector) > $2
		ORDER BY p.embedding <=> $1::vector
		LIMIT $3
	`

	rows, err := s.db.Query(query, vector, threshold, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product
		var similarity float64

		err := rows.Scan(
			&p.ID, &p.Name, &p.Slug, &p.ShortDescription, &p.Description,
			&p.CategoryID, &p.ImageURLs, &p.Features, &p.Specifications,
			&p.Status, &p.CreatedAt, &p.UpdatedAt,
			&similarity,
		)
		if err != nil {
			return nil, err
		}

		products = append(products, p)
	}

	return products, nil
}

// SearchProductsByText performs full-text search (fallback when no embedding)
func (s *SearchService) SearchProductsByText(query string, limit int) ([]models.Product, error) {
	searchQuery := fmt.Sprintf("%%%s%%", query)

	sqlQuery := `
		SELECT p.id, p.name, p.slug, p.short_description, p.description, 
		       p.category_id, p.image_urls, p.features, p.specifications, 
		       p.status, p.created_at, p.updated_at
		FROM products p
		WHERE p.status = 'published'
		  AND (p.name ILIKE $1 OR p.description ILIKE $1 OR p.short_description ILIKE $1)
		ORDER BY p.created_at DESC
		LIMIT $2
	`

	rows, err := s.db.Query(sqlQuery, searchQuery, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var products []models.Product
	for rows.Next() {
		var p models.Product

		err := rows.Scan(
			&p.ID, &p.Name, &p.Slug, &p.ShortDescription, &p.Description,
			&p.CategoryID, &p.ImageURLs, &p.Features, &p.Specifications,
			&p.Status, &p.CreatedAt, &p.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		products = append(products, p)
	}

	return products, nil
}
