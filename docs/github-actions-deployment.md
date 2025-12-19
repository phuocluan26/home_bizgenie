# Hướng dẫn GitHub Actions Deployment

## Tổng quan

GitHub Actions workflow tự động deploy code lên production server khi có tag được push lên repository.

## Quy trình Deploy

Theo quy tắc GitFlow:
- **main (tag)** → PRODUCTION → Auto deploy
- Tag format: `v*` (ví dụ: `v1.0.1`, `v.1.0.1`, `v2.0.0`)

### Khi nào workflow được trigger?

Workflow sẽ tự động chạy khi:
- Có tag mới được push lên repository
- Tag phải bắt đầu bằng `v` (ví dụ: `v1.0.1`)

### Quy trình deploy

1. **Checkout code** từ tag
2. **Setup SSH** connection tới server
3. **Clone/Update repository** trên server tại `/root/home-bizgenie`
4. **Checkout tag** cụ thể
5. **Backup database** (theo quy tắc gitflow)
6. **Build Docker images**
7. **Deploy services** với Docker Compose
8. **Chạy migrations** (nếu có)
9. **Verify deployment** và kiểm tra logs

## Cấu hình Secrets

Để workflow hoạt động, cần cấu hình các secrets sau trong GitHub repository:

### 1. DEPLOY_SSH_KEY

SSH private key để kết nối tới server production.

**Cách tạo SSH key:**

```bash
# Trên máy local hoặc server
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy

# Copy public key vào server
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub root@103.195.240.89

# Hoặc thủ công:
cat ~/.ssh/github_actions_deploy.pub | ssh root@103.195.240.89 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

**Thêm vào GitHub Secrets:**

1. Vào repository → Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `DEPLOY_SSH_KEY`
4. Value: Nội dung file `~/.ssh/github_actions_deploy` (private key)

### 2. (Tùy chọn) Các secrets khác

Nếu cần, có thể thêm các secrets khác:
- `DEPLOY_HOST`: IP server (mặc định: 103.195.240.89)
- `DEPLOY_PATH`: Đường dẫn deploy (mặc định: /root/home-bizgenie)

## Cách sử dụng

### 1. Tạo tag và push

```bash
# Tạo tag từ main branch
git checkout main
git pull origin main

# Tạo tag (theo format gitflow)
git tag -a v1.0.1 -m "Release version 1.0.1"

# Push tag lên GitHub
git push origin v1.0.1
```

### 2. Theo dõi deployment

1. Vào repository trên GitHub
2. Click tab "Actions"
3. Chọn workflow "Deploy Production"
4. Xem logs và trạng thái deployment

### 3. Kiểm tra trên server

```bash
# SSH vào server
ssh root@103.195.240.89

# Vào thư mục deploy
cd /root/home-bizgenie

# Kiểm tra tag hiện tại
git describe --tags

# Kiểm tra containers
docker-compose ps

# Xem logs
docker-compose logs -f
```

## Cấu trúc thư mục trên server

```
/root/home-bizgenie/
├── .git/                    # Git repository
├── .env                     # Environment variables (không commit)
├── backups/                 # Database backups
│   └── db_backup_*.sql
├── database/
│   ├── migrations/
│   └── seed.sql
├── main-api/
├── nextjs/
├── nginx/
├── docker-compose.yml
└── ...
```

## Xử lý lỗi

### Deployment thất bại

1. **Kiểm tra logs trong GitHub Actions**
   - Vào tab Actions → Chọn workflow run → Xem logs từng step

2. **Kiểm tra trên server**
   ```bash
   ssh root@103.195.240.89
   cd /root/home-bizgenie
   docker-compose logs
   ```

3. **Rollback về version trước**
   ```bash
   # Trên server
   cd /root/home-bizgenie
   git checkout <tag-truoc-do>
   docker-compose down
   docker-compose up -d --build
   ```

### SSH connection failed

- Kiểm tra SSH key đã được thêm vào GitHub Secrets đúng chưa
- Kiểm tra public key đã được thêm vào `~/.ssh/authorized_keys` trên server
- Kiểm tra firewall không chặn port 22

### Docker build failed

- Kiểm tra Dockerfile có lỗi không
- Kiểm tra disk space trên server: `df -h`
- Kiểm tra Docker daemon đang chạy: `systemctl status docker`

### Database migration failed

- Kiểm tra database connection trong `.env`
- Kiểm tra PostgreSQL đang chạy: `docker-compose ps postgres`
- Xem logs: `docker-compose logs postgres`

## Best Practices

1. **Luôn test trên staging trước khi deploy production**
2. **Backup database trước mỗi deployment** (đã tự động trong workflow)
3. **Kiểm tra logs sau khi deploy**
4. **Tag rõ ràng theo semantic versioning** (v1.0.1, v1.1.0, v2.0.0)
5. **Không commit file `.env`** vào repository
6. **Giữ file `.env` trên server** và không overwrite khi deploy

## Tùy chỉnh workflow

Nếu cần thay đổi server hoặc path, có thể:

1. **Sử dụng secrets** (khuyến nghị):
   - Thêm `DEPLOY_HOST` và `DEPLOY_PATH` vào GitHub Secrets
   - Cập nhật workflow để sử dụng `${{ secrets.DEPLOY_HOST }}`

2. **Sửa trực tiếp trong workflow file**:
   - Sửa IP: `103.195.240.89`
   - Sửa path: `/root/home-bizgenie`

## Lưu ý bảo mật

- ⚠️ **KHÔNG** commit SSH private key vào repository
- ⚠️ **KHÔNG** commit file `.env` với sensitive data
- ✅ Sử dụng GitHub Secrets cho tất cả sensitive information
- ✅ Sử dụng SSH key riêng cho GitHub Actions (không dùng key cá nhân)
- ✅ Giới hạn quyền SSH key chỉ cho user cần thiết

## Troubleshooting

### Workflow không chạy khi push tag

- Kiểm tra tag format có đúng `v*` không
- Kiểm tra workflow file đã được commit vào repository chưa
- Kiểm tra branch workflow file đang ở (phải có trong branch có tag)

### Services không start sau deploy

```bash
# Kiểm tra logs
docker-compose logs

# Kiểm tra resources
docker stats

# Restart services
docker-compose restart
```

### Database connection issues

```bash
# Kiểm tra PostgreSQL
docker-compose ps postgres
docker-compose logs postgres

# Test connection
docker-compose exec postgres psql -U postgres -d bizgenie_db -c "SELECT 1;"
```

## Tài liệu tham khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [GitFlow Workflow](.cursor/rules/gitflow.mdc)
