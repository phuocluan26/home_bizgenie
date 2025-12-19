# Hướng dẫn sử dụng Docker Swarm

## Tổng quan về Docker Swarm

Docker Swarm là công cụ orchestration được tích hợp sẵn trong Docker, cho phép bạn quản lý một cluster gồm nhiều Docker hosts như một hệ thống duy nhất. Swarm cung cấp các tính năng:

- **High Availability**: Tự động restart containers khi chúng fail
- **Load Balancing**: Phân phối traffic tự động
- **Scaling**: Dễ dàng scale services lên/xuống
- **Resource Management**: Quản lý CPU và RAM cho từng service
- **Rolling Updates**: Cập nhật không downtime

## Kiến trúc Docker Swarm

### Node Types

1. **Manager Nodes**: Quản lý cluster, chạy scheduler và dispatcher
2. **Worker Nodes**: Chạy các containers thực tế

### Swarm Mode vs Docker Compose

| Tính năng | Docker Compose | Docker Swarm |
|-----------|----------------|--------------|
| Single/Multi host | Single host | Multi host |
| Resource limits | Có (với deploy.resources) | Có (native) |
| Scaling | Manual | Tự động |
| High Availability | Không | Có |
| Load Balancing | Không | Có |

## Cài đặt và Khởi tạo

### 1. Khởi tạo Swarm Cluster

Trên node đầu tiên (Manager):

```bash
# Khởi tạo swarm
docker swarm init

# Kết quả sẽ hiển thị token để join worker nodes
# Lưu lại token này để thêm worker nodes sau
```

### 2. Thêm Worker Nodes

Trên các worker nodes:

```bash
# Sử dụng token từ manager node
docker swarm join --token <WORKER_TOKEN> <MANAGER_IP>:2377
```

### 3. Kiểm tra Cluster

```bash
# Xem danh sách nodes
docker node ls

# Xem thông tin chi tiết về node
docker node inspect <NODE_ID>
```

## Deploy Stack với Docker Swarm

### 1. Chuẩn bị Environment

Đảm bảo file `.env` đã được cấu hình đúng:

```bash
# Copy từ env.example
cp env.example .env

# Chỉnh sửa các biến môi trường cần thiết
```

### 2. Build Images (nếu cần)

Với Swarm, bạn có 2 lựa chọn:

**Option 1: Build images trước và push lên registry**

```bash
# Build images
docker build -t your-registry/bizgenie-main-api:latest ./main-api
docker build -t your-registry/bizgenie-nextjs:latest ./nextjs

# Push lên registry
docker push your-registry/bizgenie-main-api:latest
docker push your-registry/bizgenie-nextjs:latest
```

**Option 2: Build trên mỗi node (không khuyến nghị)**

Swarm sẽ tự động build nếu sử dụng `build` trong compose file, nhưng sẽ build trên mỗi node riêng biệt.

### 3. Deploy Stack

```bash
# Deploy stack từ docker-compose file
docker stack deploy -c docker-compose.yml bizgenie

# Hoặc sử dụng file riêng cho Swarm
docker stack deploy -c docker-compose.swarm.yml bizgenie
```

### 4. Kiểm tra Stack

```bash
# Xem danh sách services
docker service ls

# Xem chi tiết service
docker service ps bizgenie_postgres
docker service ps bizgenie_main-api
docker service ps bizgenie_nextjs
docker service ps bizgenie_nginx
docker service ps bizgenie_cloudflared

# Xem logs
docker service logs bizgenie_main-api
docker service logs bizgenie_nextjs -f  # -f để follow logs
```

## Quản lý Services

### Scale Services

```bash
# Scale service lên số lượng replicas mong muốn
docker service scale bizgenie_main-api=3
docker service scale bizgenie_nextjs=2

# Xem số lượng replicas hiện tại
docker service ls
```

### Update Services

```bash
# Update image của service
docker service update --image your-registry/bizgenie-main-api:v2.0 bizgenie_main-api

# Update environment variables
docker service update --env-add NEW_VAR=value bizgenie_main-api

# Update resource limits
docker service update --limit-cpu 2.0 --limit-memory 1G bizgenie_main-api
```

### Rolling Update

```bash
# Update với rolling update (mặc định)
docker service update --image new-image:tag bizgenie_main-api

# Update với delay giữa các batches
docker service update --update-delay 10s --update-parallelism 2 bizgenie_main-api

# Rollback về version trước
docker service rollback bizgenie_main-api
```

### Xóa Services

```bash
# Xóa một service cụ thể
docker service rm bizgenie_main-api

# Xóa toàn bộ stack
docker stack rm bizgenie
```

## Quản lý Nodes

### Xem thông tin Nodes

```bash
# Danh sách nodes
docker node ls

# Chi tiết node
docker node inspect <NODE_ID>

# Xem resource usage
docker node ps <NODE_ID>
```

### Quản lý Node Availability

```bash
# Đặt node về chế độ drain (không nhận tasks mới)
docker node update --availability drain <NODE_ID>

# Đặt node về chế độ active
docker node update --availability active <NODE_ID>

# Tạm dừng node (pause)
docker node update --availability pause <NODE_ID>
```

### Loại bỏ Node

```bash
# Trên worker node muốn rời khỏi cluster
docker swarm leave

# Trên manager node, loại bỏ node
docker node rm <NODE_ID>
```

## Quản lý Secrets và Configs

### Tạo Secrets

```bash
# Tạo secret từ file
echo "my-secret-password" | docker secret create postgres_password -

# Tạo secret từ stdin
docker secret create jwt_secret - <<< "your-jwt-secret-key"

# Xem danh sách secrets
docker secret ls

# Xem chi tiết secret
docker secret inspect <SECRET_NAME>
```

### Sử dụng Secrets trong Compose

```yaml
services:
  postgres:
    secrets:
      - postgres_password
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/postgres_password

secrets:
  postgres_password:
    external: true
```

### Tạo Configs

```bash
# Tạo config từ file
docker config create nginx_config ./nginx/nginx.conf

# Sử dụng trong service
docker service update --config-add src=nginx_config,target=/etc/nginx/nginx.conf bizgenie_nginx
```

## Monitoring và Debugging

### Xem Logs

```bash
# Logs của service
docker service logs bizgenie_main-api

# Follow logs
docker service logs -f bizgenie_main-api

# Logs của specific task
docker service logs bizgenie_main-api --task-id <TASK_ID>

# Logs với timestamps
docker service logs --timestamps bizgenie_main-api
```

### Inspect Services

```bash
# Thông tin chi tiết service
docker service inspect bizgenie_main-api

# Inspect với format
docker service inspect --pretty bizgenie_main-api
```

### Health Checks

Swarm tự động quản lý health checks được định nghĩa trong compose file:

```yaml
healthcheck:
  test: ["CMD-SHELL", "curl -f http://localhost:8080/health || exit 1"]
  interval: 10s
  timeout: 5s
  retries: 3
  start_period: 30s
```

## Best Practices

### 1. Resource Management

- Luôn đặt `reservations` và `limits` cho mỗi service
- Monitor resource usage thường xuyên
- Điều chỉnh limits dựa trên thực tế sử dụng

### 2. High Availability

- Có ít nhất 3 manager nodes (để đảm bảo quorum)
- Đặt `replicas` cho các services quan trọng
- Sử dụng health checks cho tất cả services

### 3. Security

- Sử dụng Docker Secrets cho sensitive data
- Không hardcode passwords trong compose files
- Giới hạn quyền truy cập vào manager nodes

### 4. Networking

- Sử dụng overlay networks cho multi-host communication
- Tách biệt networks cho các môi trường khác nhau
- Sử dụng service discovery (tên service = hostname)

### 5. Updates

- Luôn test updates trên staging trước
- Sử dụng rolling updates với delay phù hợp
- Có kế hoạch rollback sẵn sàng

## Troubleshooting

### Service không start

```bash
# Kiểm tra logs
docker service logs bizgenie_main-api

# Kiểm tra tasks
docker service ps bizgenie_main-api --no-trunc

# Kiểm tra node resources
docker node inspect <NODE_ID> | grep -A 10 "Resources"
```

### Service không scale

```bash
# Kiểm tra node availability
docker node ls

# Kiểm tra resource constraints
docker service inspect bizgenie_main-api | grep -A 5 "Resources"
```

### Network issues

```bash
# Kiểm tra networks
docker network ls
docker network inspect bizgenie_bizgenie-network

# Test connectivity giữa services
docker exec -it <CONTAINER_ID> ping <SERVICE_NAME>
```

## Lệnh hữu ích

```bash
# Xem tất cả stacks
docker stack ls

# Xem services trong stack
docker stack services bizgenie

# Xem tasks trong stack
docker stack ps bizgenie

# Xem logs của toàn bộ stack
docker stack services bizgenie --format "{{.Name}}" | xargs -I {} docker service logs {}

# Restart service
docker service update --force bizgenie_main-api

# Pause service
docker service scale bizgenie_main-api=0

# Resume service
docker service scale bizgenie_main-api=1
```

## Migration từ Docker Compose sang Swarm

### Những thay đổi cần lưu ý:

1. **container_name**: Không được hỗ trợ trong Swarm mode
2. **depends_on**: Không hoạt động, sử dụng health checks và restart policies
3. **build**: Nên build images trước và push lên registry
4. **volumes**: Local paths cần được mount trên tất cả nodes hoặc sử dụng named volumes
5. **ports**: Chỉ expose ports trên services cần thiết (như nginx)

### Checklist migration:

- [ ] Build và push images lên registry
- [ ] Loại bỏ `container_name` từ compose file
- [ ] Thay thế `depends_on` bằng health checks
- [ ] Chuyển local volumes sang named volumes
- [ ] Test trên staging trước khi deploy production
- [ ] Backup database trước khi deploy

## Tài liệu tham khảo

- [Docker Swarm Documentation](https://docs.docker.com/engine/swarm/)
- [Docker Stack Deploy](https://docs.docker.com/engine/reference/commandline/stack_deploy/)
- [Docker Service Commands](https://docs.docker.com/engine/reference/commandline/service/)
