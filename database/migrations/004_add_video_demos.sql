-- Migration 004: Add video demos support
-- Created for BizGenie Product Website

-- Table: video_demos
CREATE TABLE IF NOT EXISTS video_demos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    video_url VARCHAR(500) NOT NULL,
    video_type VARCHAR(20) NOT NULL DEFAULT 'url', -- 'url', 'youtube'
    youtube_id VARCHAR(100), -- YouTube video ID if video_type is 'youtube'
    thumbnail_url VARCHAR(500), -- Thumbnail image URL
    status VARCHAR(20) NOT NULL DEFAULT 'draft', -- 'draft', 'published'
    "order" INTEGER DEFAULT 0, -- Display order
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_video_demos_status ON video_demos(status);
CREATE INDEX IF NOT EXISTS idx_video_demos_order ON video_demos("order");
CREATE INDEX IF NOT EXISTS idx_video_demos_video_type ON video_demos(video_type);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_video_demos_updated_at ON video_demos;
CREATE TRIGGER update_video_demos_updated_at BEFORE UPDATE ON video_demos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
