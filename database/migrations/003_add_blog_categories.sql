-- Migration 003: Add blog categories support
-- Created for BizGenie Product Website

-- Table: blog_categories
CREATE TABLE IF NOT EXISTS blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    "order" INTEGER DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add category_id column to blog_posts (nullable)
ALTER TABLE blog_posts 
ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES blog_categories(id) ON DELETE SET NULL;

-- Create index for category_id
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category_id);

-- Create index for blog_categories slug
CREATE INDEX IF NOT EXISTS idx_blog_categories_slug ON blog_categories(slug);

-- Insert default blog categories
INSERT INTO blog_categories (name, slug, description, "order") VALUES
    ('Product', 'product', 'Bài viết về sản phẩm', 1),
    ('Case Study', 'case-study', 'Nghiên cứu tình huống', 2),
    ('How To', 'how-to', 'Hướng dẫn', 3),
    ('News', 'news', 'Tin tức', 4),
    ('Tutorial', 'tutorial', 'Hướng dẫn chi tiết', 5)
ON CONFLICT (slug) DO NOTHING;
