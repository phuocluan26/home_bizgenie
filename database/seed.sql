-- Seed data for BizGenie Product Website
-- This file contains sample data for development and testing

-- Insert admin user (password: admin123 - should be hashed in production)
-- Default password hash for 'admin123' using bcrypt
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@bizgenie.vn', '$2a$10$rK8X8X8X8X8X8X8X8X8Xe8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'admin'),
('editor', 'editor@bizgenie.vn', '$2a$10$rK8X8X8X8X8X8X8X8X8Xe8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X8X', 'editor')
ON CONFLICT (email) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, slug, description, "order") VALUES
('Giải pháp SaaS', 'giai-phap-saas', 'Các giải pháp phần mềm dạng dịch vụ', 1),
('Hệ thống quản lý', 'he-thong-quan-ly', 'Hệ thống quản lý doanh nghiệp', 2),
('Công cụ phân tích', 'cong-cu-phan-tich', 'Công cụ phân tích dữ liệu và báo cáo', 3),
('Tích hợp API', 'tich-hop-api', 'Giải pháp tích hợp và API', 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample products
INSERT INTO products (name, slug, short_description, description, category_id, image_urls, features, specifications, status) VALUES
(
    'BizGenie CRM',
    'bizgenie-crm',
    'Hệ thống quản lý quan hệ khách hàng toàn diện',
    'BizGenie CRM là giải pháp quản lý khách hàng hiện đại, giúp doanh nghiệp tối ưu hóa quy trình bán hàng và chăm sóc khách hàng. Hệ thống tích hợp đầy đủ các tính năng từ quản lý lead, pipeline, đến báo cáo và phân tích.',
    2,
    '["/images/products/crm-1.jpg", "/images/products/crm-2.jpg"]'::jsonb,
    '["Quản lý pipeline bán hàng", "Tự động hóa email marketing", "Báo cáo và phân tích real-time", "Tích hợp đa kênh", "Mobile app đầy đủ tính năng"]'::jsonb,
    '{"platform": "Web, iOS, Android", "pricing": "Từ 500.000đ/tháng", "support": "24/7", "integration": "API, Webhook, Zapier"}'::jsonb,
    'published'
),
(
    'BizGenie Analytics',
    'bizgenie-analytics',
    'Công cụ phân tích dữ liệu doanh nghiệp mạnh mẽ',
    'BizGenie Analytics cung cấp khả năng phân tích dữ liệu sâu sắc với AI/ML, giúp doanh nghiệp đưa ra quyết định dựa trên dữ liệu. Hỗ trợ nhiều nguồn dữ liệu và visualization đa dạng.',
    3,
    '["/images/products/analytics-1.jpg"]'::jsonb,
    '["Dashboard tùy biến", "AI-powered insights", "Real-time data processing", "Export đa định dạng", "Collaborative reports"]'::jsonb,
    '{"platform": "Web", "pricing": "Từ 1.000.000đ/tháng", "data_sources": "Unlimited", "retention": "2 năm"}'::jsonb,
    'published'
),
(
    'BizGenie API Gateway',
    'bizgenie-api-gateway',
    'Cổng kết nối API tập trung và bảo mật',
    'Giải pháp quản lý API tập trung với khả năng bảo mật cao, rate limiting, monitoring và analytics. Hỗ trợ REST và GraphQL APIs.',
    4,
    '["/images/products/api-1.jpg"]'::jsonb,
    '["API versioning", "Rate limiting", "Authentication & Authorization", "Request/Response transformation", "API analytics"]'::jsonb,
    '{"platform": "Cloud, On-premise", "pricing": "Theo số lượng API calls", "support": "Enterprise SLA"}'::jsonb,
    'published'
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample blog posts
INSERT INTO blog_posts (title, slug, excerpt, content, featured_image, author_id, status, published_at) VALUES
(
    'Xu hướng SaaS năm 2024: Tương lai của doanh nghiệp số',
    'xuat-huong-saas-2024',
    'Khám phá các xu hướng công nghệ SaaS đang định hình tương lai của doanh nghiệp số hóa.',
    'Nội dung bài viết về xu hướng SaaS năm 2024...',
    '/images/blog/saas-trends-2024.jpg',
    1,
    'published',
    CURRENT_TIMESTAMP
),
(
    'Cách chọn giải pháp CRM phù hợp cho doanh nghiệp vừa và nhỏ',
    'chon-giai-phap-crm',
    'Hướng dẫn chi tiết về cách đánh giá và lựa chọn hệ thống CRM phù hợp với quy mô và ngân sách.',
    'Nội dung bài viết về cách chọn CRM...',
    '/images/blog/choose-crm.jpg',
    1,
    'published',
    CURRENT_TIMESTAMP
)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample contacts
INSERT INTO contacts (name, email, phone, company, message, status) VALUES
(
    'Nguyễn Văn A',
    'nguyenvana@example.com',
    '0901234567',
    'Công ty ABC',
    'Tôi muốn tìm hiểu về giải pháp CRM của BizGenie.',
    'new'
),
(
    'Trần Thị B',
    'tranthib@example.com',
    '0987654321',
    'Công ty XYZ',
    'Cần tư vấn về gói Analytics.',
    'read'
)
ON CONFLICT DO NOTHING;
