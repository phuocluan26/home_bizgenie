# Cải thiện Hệ thống Migration và Logging

## Tổng quan

Đã kiểm tra và cải thiện toàn bộ hệ thống migration, logging và error handling trong main-api.

## Các vấn đề đã phát hiện và sửa

### 1. Migration Tracking System

**Vấn đề:**
- Migration không có hệ thống tracking, chỉ dựa vào việc kiểm tra lỗi "already exists"
- Không thể biết chính xác migration nào đã chạy
- Có thể chạy lại migration nhiều lần không cần thiết

**Giải pháp:**
- Tạo bảng `schema_migrations` để track migrations đã chạy
- Mỗi migration được đánh dấu sau khi chạy thành công
- Sử dụng transaction để đảm bảo atomicity
- Logging chi tiết cho mỗi bước migration

**File mới:**
- `database/migrations/000_create_migrations_table.sql` - Tạo bảng tracking (được tạo tự động trong code)

**Code changes:**
- `internal/database/database.go`:
  - `ensureMigrationsTable()` - Tạo bảng tracking
  - `isMigrationApplied()` - Kiểm tra migration đã chạy chưa
  - `markMigrationApplied()` - Đánh dấu migration đã chạy
  - `RunMigrations()` - Cải thiện với transaction và tracking

### 2. Case-Insensitive Username Lookup

**Vấn đề:**
- Username lookup là case-sensitive
- User login với "Admin" nhưng database có "admin" → không tìm thấy
- Gây lỗi authentication không cần thiết

**Giải pháp:**
- Sử dụng `LOWER()` trong SQL query để so sánh case-insensitive
- Username "Admin", "admin", "ADMIN" đều có thể login

**Code changes:**
- `internal/services/user_service.go`:
  - `GetUserByUsername()` - Sử dụng `LOWER(username) = LOWER($1)`

### 3. IVFFlat Index Creation

**Vấn đề:**
- IVFFlat index yêu cầu có dữ liệu trước khi tạo
- Migration cố tạo index ngay khi chưa có data → có thể gây lỗi

**Giải pháp:**
- Loại bỏ IVFFlat index creation khỏi migration
- Thêm comment hướng dẫn tạo index sau khi có data
- Index có thể được tạo thủ công hoặc qua migration riêng sau khi seed data

**Code changes:**
- `database/migrations/002_add_pgvector.sql` - Loại bỏ IVFFlat index creation

### 4. Logging Improvements

**Cải thiện:**
- Thêm logging chi tiết trong migration process
- Log từng bước: check status, read file, execute, mark as applied
- Log errors với context đầy đủ
- Log info khi migration đã được apply

**Code changes:**
- `internal/database/database.go`:
  - Log migration directory path
  - Log khi check migration status
  - Log khi chạy migration
  - Log khi mark migration as applied
  - Log errors với context

### 5. Error Handling Improvements

**Cải thiện:**
- Sử dụng transaction cho migration để đảm bảo atomicity
- Rollback nếu có lỗi
- Xử lý backward compatibility với migrations cũ
- Logging errors với context đầy đủ

## Cấu trúc Migration Files

```
database/migrations/
├── 000_create_migrations_table.sql  (tạo tự động trong code)
├── 001_init_schema.sql              (tables, indexes, triggers)
└── 002_add_pgvector.sql            (pgvector extension, embedding column)
```

## Migration Flow

1. **Startup:**
   ```
   → Ensure migrations table exists
   → Check each migration status
   → Run unapplied migrations
   → Mark as applied
   ```

2. **For each migration:**
   ```
   → Check if already applied (from schema_migrations table)
   → If applied: skip
   → If not applied:
      → Begin transaction
      → Execute migration SQL
      → Mark as applied in schema_migrations
      → Commit transaction
   ```

## Testing Migration

### Kiểm tra migrations đã chạy:
```sql
SELECT * FROM schema_migrations ORDER BY applied_at;
```

### Reset migrations (development only):
```sql
-- Xóa bảng tracking (sẽ chạy lại migrations)
DROP TABLE IF EXISTS schema_migrations CASCADE;
```

### Kiểm tra tables đã tạo:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

## Username Lookup

### Trước khi sửa:
```sql
SELECT * FROM users WHERE username = 'Admin';  -- Không tìm thấy nếu DB có 'admin'
```

### Sau khi sửa:
```sql
SELECT * FROM users WHERE LOWER(username) = LOWER('Admin');  -- Tìm thấy
```

## Logging Output

### Migration logs:
```
[INFO] Starting database migrations from directory: /migrations
[INFO] Migration already applied: 001_init_schema.sql
[INFO] Running migration: 002_add_pgvector.sql
[INFO] Migration completed successfully: 002_add_pgvector.sql
```

### Login logs (với case-insensitive):
```
[DEBUG] Login attempt for username: Admin
[DEBUG] Querying user by username: Admin
[DEBUG] User found: ID=1, username=admin (queried as: Admin)
[INFO] User logged in successfully - username: admin, user_id: 1
```

## Best Practices

1. **Migration Naming:**
   - Format: `NNN_description.sql`
   - Số thứ tự tăng dần
   - Mô tả rõ ràng

2. **Migration Content:**
   - Sử dụng `IF NOT EXISTS` cho tables, indexes
   - Sử dụng `CREATE OR REPLACE` cho functions
   - Tránh DROP statements trừ khi cần thiết

3. **Testing:**
   - Test migrations trên database mới
   - Test migrations trên database đã có data
   - Test rollback scenarios

4. **Deployment:**
   - Backup database trước khi chạy migrations
   - Chạy migrations trong transaction
   - Monitor logs để phát hiện lỗi sớm

## Troubleshooting

### Migration không chạy:
- Kiểm tra `MIGRATION_DIR` environment variable
- Kiểm tra file có tồn tại không
- Kiểm tra logs để xem lỗi cụ thể

### Migration đã chạy nhưng không được mark:
- Kiểm tra `schema_migrations` table
- Có thể mark thủ công nếu cần:
  ```sql
  INSERT INTO schema_migrations (version) VALUES ('001_init_schema');
  ```

### Username không tìm thấy:
- Kiểm tra username trong database (case-sensitive)
- Với case-insensitive lookup, "Admin" sẽ tìm thấy "admin"
- Kiểm tra logs để xem query được thực thi

## Next Steps

1. Tạo migration script để seed initial data
2. Tạo migration để tạo IVFFlat index sau khi có data
3. Thêm migration rollback functionality (nếu cần)
4. Tạo admin interface để xem migration status
