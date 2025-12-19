-- Migration 002: Add pgvector extension and embedding column
-- Created for BizGenie Product Website

-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Add embedding column to products table for semantic search
-- Using 1536 dimensions (OpenAI ada-002 standard)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS embedding vector(1536);

-- Add comment
COMMENT ON COLUMN products.embedding IS 'Vector embedding for semantic search using pgvector';

-- Note: IVFFlat index creation is deferred until there is data
-- IVFFlat index requires at least some rows to be created
-- This should be done manually after seeding data or via a separate migration
-- Example: CREATE INDEX idx_products_embedding ON products USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
