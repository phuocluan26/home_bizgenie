-- Migration 005: Add social media links support
-- Created for BizGenie Product Website

-- Table: social_media_links
CREATE TABLE IF NOT EXISTS social_media_links (
    id SERIAL PRIMARY KEY,
    platform VARCHAR(50) NOT NULL, -- 'facebook', 'linkedin', 'twitter', 'youtube', 'instagram', etc.
    url VARCHAR(500) NOT NULL,
    icon_name VARCHAR(100), -- Icon name for lucide-react (e.g., 'Facebook', 'Linkedin', 'Twitter')
    "order" INTEGER DEFAULT 0, -- Display order
    is_active BOOLEAN NOT NULL DEFAULT true, -- Whether to display this link
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_social_media_links_platform ON social_media_links(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_links_order ON social_media_links("order");
CREATE INDEX IF NOT EXISTS idx_social_media_links_is_active ON social_media_links(is_active);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_social_media_links_updated_at ON social_media_links;
CREATE TRIGGER update_social_media_links_updated_at BEFORE UPDATE ON social_media_links
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
