# Build stage
FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy toàn bộ mã nguồn vào container
COPY . .

# Download dependencies và tạo go.sum trong container
RUN go mod download
RUN go mod tidy
RUN go mod verify

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./cmd/server

# Final stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates

WORKDIR /root/

# Copy the binary from builder
COPY --from=builder /app/main .

# Copy migration files (if needed at runtime)
# Note: Migrations are run via database service, but we can copy them here if needed
# COPY --from=builder /app/../../database/migrations ./migrations

# Expose port
EXPOSE 8080

# Run the binary
CMD ["./main"]
