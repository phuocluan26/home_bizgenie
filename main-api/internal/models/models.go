package models

import (
	"database/sql/driver"
	"encoding/json"
	"strings"
	"time"

	"github.com/pgvector/pgvector-go"
)

// User represents a user in the system
type User struct {
	ID           int       `json:"id" db:"id"`
	Username     string    `json:"username" db:"username"`
	Email        string    `json:"email" db:"email"`
	PasswordHash string    `json:"-" db:"password_hash"`
	Role         string    `json:"role" db:"role"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// Category represents a product category
type Category struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description *string   `json:"description,omitempty" db:"description"`
	ParentID    *int      `json:"parent_id,omitempty" db:"parent_id"`
	Order       int       `json:"order" db:"order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// Product represents a product
type Product struct {
	ID              int            `json:"id" db:"id"`
	Name            string         `json:"name" db:"name"`
	Slug            string         `json:"slug" db:"slug"`
	ShortDescription *string       `json:"short_description,omitempty" db:"short_description"`
	Description     *string        `json:"description,omitempty" db:"description"`
	CategoryID      int            `json:"category_id" db:"category_id"`
	ImageURLs       JSONB          `json:"image_urls,omitempty" db:"image_urls"`
	Features        JSONB          `json:"features,omitempty" db:"features"`
	Specifications  JSONB          `json:"specifications,omitempty" db:"specifications"`
	Status          string         `json:"status" db:"status"`
	Embedding       *pgvector.Vector `json:"-" db:"embedding"`
	CreatedAt       time.Time      `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time      `json:"updated_at" db:"updated_at"`
	Category        *Category      `json:"category,omitempty"`
}

// ProductImage represents a product image
type ProductImage struct {
	ID        int       `json:"id" db:"id"`
	ProductID int       `json:"product_id" db:"product_id"`
	ImageURL  string    `json:"image_url" db:"image_url"`
	Order     int       `json:"order" db:"order"`
	AltText   *string   `json:"alt_text,omitempty" db:"alt_text"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// BlogCategory represents a blog category
type BlogCategory struct {
	ID          int       `json:"id" db:"id"`
	Name        string    `json:"name" db:"name"`
	Slug        string    `json:"slug" db:"slug"`
	Description *string   `json:"description,omitempty" db:"description"`
	Order       int       `json:"order" db:"order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
}

// BlogPost represents a blog post
type BlogPost struct {
	ID            int       `json:"id" db:"id"`
	Title         string    `json:"title" db:"title"`
	Slug          string    `json:"slug" db:"slug"`
	Excerpt       *string   `json:"excerpt,omitempty" db:"excerpt"`
	Content       string    `json:"content" db:"content"`
	FeaturedImage *string   `json:"featured_image,omitempty" db:"featured_image"`
	AuthorID      int       `json:"author_id" db:"author_id"`
	CategoryID    *int      `json:"category_id,omitempty" db:"category_id"`
	Status        string    `json:"status" db:"status"`
	PublishedAt   *FlexibleTime `json:"published_at,omitempty" db:"published_at"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
	UpdatedAt     time.Time `json:"updated_at" db:"updated_at"`
	Author        *User     `json:"author,omitempty"`
	Category      *BlogCategory `json:"category,omitempty"`
}

// FlexibleTime is a time type that can parse multiple datetime formats
type FlexibleTime struct {
	time.Time
}

func (ft *FlexibleTime) UnmarshalJSON(data []byte) error {
	if len(data) == 0 || string(data) == "null" || string(data) == `""` {
		ft.Time = time.Time{}
		return nil
	}

	// Remove quotes
	str := strings.Trim(string(data), `"`)

	// Try multiple formats
	formats := []string{
		time.RFC3339,                    // "2006-01-02T15:04:05Z07:00"
		time.RFC3339Nano,                // "2006-01-02T15:04:05.999999999Z07:00"
		"2006-01-02T15:04:05Z",          // "2006-01-02T15:04:05Z"
		"2006-01-02T15:04:05",           // "2006-01-02T15:04:05"
		"2006-01-02T15:04",              // "2006-01-02T15:04" (datetime-local format)
		"2006-01-02 15:04:05",           // "2006-01-02 15:04:05"
		"2006-01-02",                     // "2006-01-02"
	}

	for _, format := range formats {
		if t, err := time.Parse(format, str); err == nil {
			ft.Time = t
			return nil
		}
	}

	// If all formats fail, return error
	return json.Unmarshal(data, &ft.Time)
}

func (ft FlexibleTime) MarshalJSON() ([]byte, error) {
	if ft.Time.IsZero() {
		return []byte("null"), nil
	}
	return json.Marshal(ft.Time.Format(time.RFC3339))
}

func (ft *FlexibleTime) Scan(value interface{}) error {
	if value == nil {
		ft.Time = time.Time{}
		return nil
	}
	switch v := value.(type) {
	case time.Time:
		ft.Time = v
		return nil
	case []byte:
		return ft.UnmarshalJSON(v)
	case string:
		return ft.UnmarshalJSON([]byte(v))
	}
	return nil
}

func (ft FlexibleTime) Value() (driver.Value, error) {
	if ft.Time.IsZero() {
		return nil, nil
	}
	return ft.Time, nil
}

// Contact represents a contact form submission
type Contact struct {
	ID        int       `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Email     string    `json:"email" db:"email"`
	Phone     *string   `json:"phone,omitempty" db:"phone"`
	Company   *string   `json:"company,omitempty" db:"company"`
	Message   string    `json:"message" db:"message"`
	Status    string    `json:"status" db:"status"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
}

// VideoDemo represents a video demo
type VideoDemo struct {
	ID          int       `json:"id" db:"id"`
	Title       string    `json:"title" db:"title"`
	Description *string   `json:"description,omitempty" db:"description"`
	VideoURL    string    `json:"video_url" db:"video_url"`
	VideoType   string    `json:"video_type" db:"video_type"` // 'url' or 'youtube'
	YouTubeID   *string   `json:"youtube_id,omitempty" db:"youtube_id"`
	ThumbnailURL *string  `json:"thumbnail_url,omitempty" db:"thumbnail_url"`
	Status      string    `json:"status" db:"status"`
	Order       int       `json:"order" db:"order"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time `json:"updated_at" db:"updated_at"`
}

// SocialMediaLink represents a social media link
type SocialMediaLink struct {
	ID        int       `json:"id" db:"id"`
	Platform  string    `json:"platform" db:"platform"`
	URL       string    `json:"url" db:"url"`
	IconName  *string   `json:"icon_name,omitempty" db:"icon_name"`
	Order     int       `json:"order" db:"order"`
	IsActive  bool      `json:"is_active" db:"is_active"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

// JSONB is a helper type for PostgreSQL JSONB columns
type JSONB json.RawMessage

func (j *JSONB) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONB) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		*j = nil
		return nil
	}
	// Validate JSON before storing
	if len(bytes) > 0 {
		var temp interface{}
		if err := json.Unmarshal(bytes, &temp); err != nil {
			// If invalid JSON, set to null
			*j = nil
			return nil
		}
	}
	*j = JSONB(bytes)
	return nil
}

func (j JSONB) MarshalJSON() ([]byte, error) {
	if j == nil || len(j) == 0 {
		return []byte("null"), nil
	}
	// Validate JSON before marshaling
	var temp interface{}
	if err := json.Unmarshal(j, &temp); err != nil {
		// If invalid JSON, return null
		return []byte("null"), nil
	}
	// Return the raw JSON bytes directly (they're already valid JSON)
	return j, nil
}

func (j *JSONB) UnmarshalJSON(data []byte) error {
	if j == nil {
		return nil
	}
	*j = JSONB(data)
	return nil
}
