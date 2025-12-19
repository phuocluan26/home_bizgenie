# Hệ thống Logging - Main API

## Tổng quan

Hệ thống logging được tích hợp vào main-api để theo dõi và debug các lỗi, cũng như ghi lại các hoạt động quan trọng của ứng dụng.

## Cấu trúc

### Package Logger (`internal/logger/logger.go`)

Package logger cung cấp các hàm logging với 4 mức độ:

- **DEBUG**: Thông tin chi tiết để debug, chỉ hiển thị khi log level = DEBUG
- **INFO**: Thông tin hoạt động bình thường của ứng dụng
- **WARN**: Cảnh báo về các vấn đề không nghiêm trọng
- **ERROR**: Lỗi nghiêm trọng cần được xử lý

### Các hàm logging

```go
// Log debug message
logger.Debug("Format string: %s", value)

// Log info message
logger.Info("Format string: %s", value)

// Log warning message
logger.Warn("Format string: %s", value)

// Log error message
logger.Error("Format string: %s", value)

// Log error with error object
logger.ErrorWithErr("Error message", err)

// Log fatal error and exit
logger.Fatal("Fatal error: %s", message)
logger.FatalWithErr("Fatal error", err)
```

## Cấu hình

### Environment Variables

Thêm biến môi trường `LOG_LEVEL` vào file `.env`:

```env
LOG_LEVEL=debug  # Các giá trị: debug, info, warn, error
```

Mặc định: `info`

### Các mức log

- **debug**: Hiển thị tất cả log (DEBUG, INFO, WARN, ERROR)
- **info**: Hiển thị INFO, WARN, ERROR (không hiển thị DEBUG)
- **warn**: Chỉ hiển thị WARN và ERROR
- **error**: Chỉ hiển thị ERROR

## Middleware

### Request Logger (`internal/middleware/logging.go`)

Middleware tự động log tất cả HTTP requests với thông tin:
- HTTP method
- Request path
- Status code
- Latency (thời gian xử lý)
- Client IP
- User-Agent (chỉ trong log ERROR và DEBUG)

**Ví dụ log:**
```
[2024-01-15 10:30:45] [INFO] [logging.go:25] HTTP GET /api/products | Status: 200 | Latency: 15.2ms | IP: 192.168.1.1
```

### Error Handler (`internal/middleware/error.go`)

Middleware xử lý và log tất cả các lỗi xảy ra trong request:
- Log error với stack trace (khi ở chế độ DEBUG)
- Trả về response lỗi phù hợp cho client

## Tích hợp vào Code

### Trong Handlers

```go
import "bizgenie-api/internal/logger"

func (h *Handlers) GetProduct(c *gin.Context) {
    product, err := h.productService.GetProductByID(id)
    if err != nil {
        logger.ErrorWithErr("Failed to get product", err)
        c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
        return
    }
    logger.Debug("Product retrieved: ID=%d", product.ID)
    c.JSON(http.StatusOK, gin.H{"data": product})
}
```

### Trong Services

```go
import "bizgenie-api/internal/logger"

func (s *ProductService) CreateProduct(product *models.Product) error {
    // ... logic ...
    if err != nil {
        logger.ErrorWithErr("Failed to create product in database", err)
        return err
    }
    logger.Info("Product created successfully: ID=%d", product.ID)
    return nil
}
```

### Trong Database

```go
import "bizgenie-api/internal/logger"

func Connect(databaseURL string) (*sql.DB, error) {
    logger.Debug("Connecting to database...")
    db, err := sql.Open("postgres", databaseURL)
    if err != nil {
        logger.ErrorWithErr("Failed to open database connection", err)
        return nil, err
    }
    logger.Info("Database connected successfully")
    return db, nil
}
```

## Format Log

Tất cả log messages có format:

```
[TIMESTAMP] [LEVEL] [FILE:LINE] MESSAGE
```

**Ví dụ:**
```
[2024-01-15 10:30:45] [ERROR] [products.go:58] Failed to get product: sql: no rows in result set
```

## Best Practices

1. **Sử dụng DEBUG cho thông tin chi tiết**: Chỉ dùng khi cần debug, không dùng trong production
2. **Sử dụng INFO cho các hoạt động quan trọng**: Như tạo, cập nhật, xóa records
3. **Sử dụng WARN cho các cảnh báo**: Như validation errors, unauthorized access attempts
4. **Sử dụng ERROR cho các lỗi nghiêm trọng**: Như database errors, service failures
5. **Luôn log errors với ErrorWithErr**: Để có thông tin chi tiết về lỗi
6. **Không log thông tin nhạy cảm**: Như passwords, tokens, personal data

## Ví dụ Log Output

### Development Mode (LOG_LEVEL=debug)

```
[2024-01-15 10:30:45] [INFO] [main.go:25] Logger initialized with level: debug
[2024-01-15 10:30:45] [DEBUG] [database.go:14] Connecting to database...
[2024-01-15 10:30:45] [INFO] [main.go:30] Database connected successfully
[2024-01-15 10:30:50] [INFO] [logging.go:25] HTTP GET /api/products | Status: 200 | Latency: 15.2ms | IP: 192.168.1.1
[2024-01-15 10:30:50] [DEBUG] [logging.go:30] Request details - Method: GET, Path: /api/products, Status: 200, Latency: 15.2ms, IP: 192.168.1.1, User-Agent: Mozilla/5.0...
```

### Production Mode (LOG_LEVEL=info)

```
[2024-01-15 10:30:45] [INFO] [main.go:25] Logger initialized with level: info
[2024-01-15 10:30:45] [INFO] [main.go:30] Database connected successfully
[2024-01-15 10:30:50] [INFO] [logging.go:25] HTTP GET /api/products | Status: 200 | Latency: 15.2ms | IP: 192.168.1.1
[2024-01-15 10:30:55] [ERROR] [products.go:58] Failed to get product: connection timeout
```

## Troubleshooting

### Không thấy log DEBUG

- Kiểm tra `LOG_LEVEL` trong `.env` file, phải là `debug`
- Đảm bảo đã restart server sau khi thay đổi environment variable

### Log quá nhiều trong production

- Đặt `LOG_LEVEL=error` hoặc `LOG_LEVEL=warn` trong production
- Chỉ log các thông tin cần thiết

### Stack trace không hiển thị

- Stack trace chỉ hiển thị khi `LOG_LEVEL=debug`
- Đảm bảo error middleware được áp dụng đúng thứ tự trong middleware chain
