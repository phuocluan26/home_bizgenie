package services

import (
	"database/sql"
	"fmt"
	"time"

	"bizgenie-api/internal/models"
)

type BlogService struct {
	db *sql.DB
}

func NewBlogService(db *sql.DB) *BlogService {
	return &BlogService{db: db}
}

func (s *BlogService) GetBlogPosts(status string, limit, offset int) ([]models.BlogPost, error) {
	query := `
		SELECT b.id, b.title, b.slug, b.excerpt, b.content, b.featured_image,
		       b.author_id, b.category_id, b.status, b.published_at, b.created_at, b.updated_at,
		       u.id, u.username, u.email, u.role, u.created_at,
		       bc.id, bc.name, bc.slug, bc.description, bc."order", bc.created_at
		FROM blog_posts b
		LEFT JOIN users u ON b.author_id = u.id
		LEFT JOIN blog_categories bc ON b.category_id = bc.id
		WHERE 1=1
	`
	args := []interface{}{}
	argPos := 1

	if status != "" {
		query += " AND b.status = $1"
		args = append(args, status)
		argPos++
	}

	query += fmt.Sprintf(" ORDER BY b.published_at DESC, b.created_at DESC LIMIT $%d OFFSET $%d", argPos, argPos+1)
	args = append(args, limit, offset)

	rows, err := s.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var posts []models.BlogPost
	for rows.Next() {
		var p models.BlogPost
		var author models.User
		var category models.BlogCategory
		var categoryID sql.NullInt64
		var categoryName sql.NullString
		var categorySlug sql.NullString
		var categoryDesc sql.NullString
		var categoryOrder sql.NullInt64
		var categoryCreatedAt sql.NullTime
		var pCategoryID sql.NullInt64

		err := rows.Scan(
			&p.ID, &p.Title, &p.Slug, &p.Excerpt, &p.Content, &p.FeaturedImage,
			&p.AuthorID, &pCategoryID, &p.Status, &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
			&author.ID, &author.Username, &author.Email, &author.Role, &author.CreatedAt,
			&categoryID, &categoryName, &categorySlug, &categoryDesc, &categoryOrder, &categoryCreatedAt,
		)
		if err != nil {
			return nil, err
		}

		if pCategoryID.Valid {
			id := int(pCategoryID.Int64)
			p.CategoryID = &id
		}

		p.Author = &author

		if categoryID.Valid {
			category.ID = int(categoryID.Int64)
			if categoryName.Valid {
				category.Name = categoryName.String
			}
			if categorySlug.Valid {
				category.Slug = categorySlug.String
			}
			if categoryDesc.Valid {
				category.Description = &categoryDesc.String
			}
			if categoryOrder.Valid {
				category.Order = int(categoryOrder.Int64)
			}
			if categoryCreatedAt.Valid {
				category.CreatedAt = categoryCreatedAt.Time
			}
			p.Category = &category
		}

		posts = append(posts, p)
	}

	return posts, nil
}

func (s *BlogService) GetBlogPostByID(id int) (*models.BlogPost, error) {
	query := `
		SELECT b.id, b.title, b.slug, b.excerpt, b.content, b.featured_image,
		       b.author_id, b.category_id, b.status, b.published_at, b.created_at, b.updated_at,
		       u.id, u.username, u.email, u.role, u.created_at,
		       bc.id, bc.name, bc.slug, bc.description, bc."order", bc.created_at
		FROM blog_posts b
		LEFT JOIN users u ON b.author_id = u.id
		LEFT JOIN blog_categories bc ON b.category_id = bc.id
		WHERE b.id = $1
	`

	var p models.BlogPost
	var author models.User
	var category models.BlogCategory
	var categoryID sql.NullInt64
	var categoryName sql.NullString
	var categorySlug sql.NullString
	var categoryDesc sql.NullString
	var categoryOrder sql.NullInt64
	var categoryCreatedAt sql.NullTime
	var pCategoryID sql.NullInt64

	err := s.db.QueryRow(query, id).Scan(
		&p.ID, &p.Title, &p.Slug, &p.Excerpt, &p.Content, &p.FeaturedImage,
		&p.AuthorID, &pCategoryID, &p.Status, &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
		&author.ID, &author.Username, &author.Email, &author.Role, &author.CreatedAt,
		&categoryID, &categoryName, &categorySlug, &categoryDesc, &categoryOrder, &categoryCreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if pCategoryID.Valid {
		id := int(pCategoryID.Int64)
		p.CategoryID = &id
	}

	p.Author = &author

	if categoryID.Valid {
		category.ID = int(categoryID.Int64)
		if categoryName.Valid {
			category.Name = categoryName.String
		}
		if categorySlug.Valid {
			category.Slug = categorySlug.String
		}
		if categoryDesc.Valid {
			category.Description = &categoryDesc.String
		}
		if categoryOrder.Valid {
			category.Order = int(categoryOrder.Int64)
		}
		if categoryCreatedAt.Valid {
			category.CreatedAt = categoryCreatedAt.Time
		}
		p.Category = &category
	}

	return &p, nil
}

func (s *BlogService) GetBlogPostBySlug(slug string) (*models.BlogPost, error) {
	query := `
		SELECT b.id, b.title, b.slug, b.excerpt, b.content, b.featured_image,
		       b.author_id, b.category_id, b.status, b.published_at, b.created_at, b.updated_at,
		       u.id, u.username, u.email, u.role, u.created_at,
		       bc.id, bc.name, bc.slug, bc.description, bc."order", bc.created_at
		FROM blog_posts b
		LEFT JOIN users u ON b.author_id = u.id
		LEFT JOIN blog_categories bc ON b.category_id = bc.id
		WHERE b.slug = $1
	`

	var p models.BlogPost
	var author models.User
	var category models.BlogCategory
	var categoryID sql.NullInt64
	var categoryName sql.NullString
	var categorySlug sql.NullString
	var categoryDesc sql.NullString
	var categoryOrder sql.NullInt64
	var categoryCreatedAt sql.NullTime
	var pCategoryID sql.NullInt64

	err := s.db.QueryRow(query, slug).Scan(
		&p.ID, &p.Title, &p.Slug, &p.Excerpt, &p.Content, &p.FeaturedImage,
		&p.AuthorID, &pCategoryID, &p.Status, &p.PublishedAt, &p.CreatedAt, &p.UpdatedAt,
		&author.ID, &author.Username, &author.Email, &author.Role, &author.CreatedAt,
		&categoryID, &categoryName, &categorySlug, &categoryDesc, &categoryOrder, &categoryCreatedAt,
	)
	if err != nil {
		return nil, err
	}

	if pCategoryID.Valid {
		id := int(pCategoryID.Int64)
		p.CategoryID = &id
	}

	p.Author = &author

	if categoryID.Valid {
		category.ID = int(categoryID.Int64)
		if categoryName.Valid {
			category.Name = categoryName.String
		}
		if categorySlug.Valid {
			category.Slug = categorySlug.String
		}
		if categoryDesc.Valid {
			category.Description = &categoryDesc.String
		}
		if categoryOrder.Valid {
			category.Order = int(categoryOrder.Int64)
		}
		if categoryCreatedAt.Valid {
			category.CreatedAt = categoryCreatedAt.Time
		}
		p.Category = &category
	}

	return &p, nil
}

// CreateBlogPost tạo bài viết blog mới
// Nếu bỏ trống thời gian tạo (published_at), hệ thống sẽ tự động lấy ngày giờ hiện tại
func (s *BlogService) CreateBlogPost(p *models.BlogPost) error {
	query := `
		INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id, category_id, status, published_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id, created_at, updated_at
	`

	now := time.Now()
	// Nếu không có published_at hoặc là zero time, tự động set là thời gian hiện tại
	// Điều này đảm bảo mọi bài viết đều có thời gian xuất bản, kể cả khi người dùng bỏ trống
	if p.PublishedAt == nil || p.PublishedAt.Time.IsZero() {
		p.PublishedAt = &models.FlexibleTime{Time: now}
	}

	var publishedAtValue interface{}
	if p.PublishedAt != nil && !p.PublishedAt.Time.IsZero() {
		publishedAtValue = p.PublishedAt.Time
	} else {
		// Fallback: nếu vẫn không có giá trị, dùng thời gian hiện tại
		publishedAtValue = now
	}

	err := s.db.QueryRow(
		query, p.Title, p.Slug, p.Excerpt, p.Content, p.FeaturedImage,
		p.AuthorID, p.CategoryID, p.Status, publishedAtValue,
	).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)

	return err
}

func (s *BlogService) UpdateBlogPost(id int, p *models.BlogPost) error {
	query := `
		UPDATE blog_posts 
		SET title = $2, slug = $3, excerpt = $4, content = $5, 
		    featured_image = $6, category_id = $7, status = $8, published_at = $9, 
		    updated_at = CURRENT_TIMESTAMP
		WHERE id = $1
		RETURNING updated_at
	`

	now := time.Now()
	if p.Status == "published" && (p.PublishedAt == nil || p.PublishedAt.Time.IsZero()) {
		p.PublishedAt = &models.FlexibleTime{Time: now}
	}

	var publishedAtValue interface{}
	if p.PublishedAt != nil && !p.PublishedAt.Time.IsZero() {
		publishedAtValue = p.PublishedAt.Time
	} else {
		publishedAtValue = nil
	}

	err := s.db.QueryRow(
		query, id, p.Title, p.Slug, p.Excerpt, p.Content,
		p.FeaturedImage, p.CategoryID, p.Status, publishedAtValue,
	).Scan(&p.UpdatedAt)

	return err
}

func (s *BlogService) DeleteBlogPost(id int) error {
	query := `DELETE FROM blog_posts WHERE id = $1`
	_, err := s.db.Exec(query, id)
	return err
}
