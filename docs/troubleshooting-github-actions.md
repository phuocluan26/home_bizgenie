# Troubleshooting GitHub Actions - Actions không chạy

## Checklist kiểm tra

### 1. ✅ Workflow file đã được commit và push

**Kiểm tra:**
```bash
git status .github/workflows/deploy-production.yml
```

**Nếu chưa commit:**
```bash
git add .github/workflows/deploy-production.yml
git commit -m "feat(ci): thêm GitHub Actions workflow deploy production"
git push origin <branch-name>
```

**Lưu ý quan trọng:** Workflow file phải có trong branch mà bạn đang push tag. Nếu tag được tạo từ branch `main`, workflow file cũng phải có trong branch `main`.

### 2. ✅ Tag format đúng

**Tag phải bắt đầu bằng `v`:**
- ✅ Đúng: `v1.0.1`, `v1.0.0`, `v.1.0.1`
- ❌ Sai: `1.0.1`, `release-1.0.1`, `version-1.0.1`

**Tạo và push tag:**
```bash
# Tạo tag
git tag -a v1.0.1 -m "Release version 1.0.1"

# Push tag lên remote
git push origin v1.0.1
```

**Kiểm tra tag đã push:**
```bash
git ls-remote --tags origin | grep "v"
```

### 3. ✅ GitHub Actions đã được enable

**Kiểm tra trên GitHub:**
1. Vào repository → **Settings** → **Actions** → **General**
2. Đảm bảo các tùy chọn sau được bật:
   - ✅ **Allow all actions and reusable workflows**
   - ✅ **Allow actions created by GitHub**
   - ✅ **Allow actions by Marketplace verified creators**

### 4. ✅ DEPLOY_SSH_KEY secret đã được thêm

**Kiểm tra:**
1. Vào repository → **Settings** → **Secrets and variables** → **Actions**
2. Tìm `DEPLOY_SSH_KEY` trong danh sách

**Nếu chưa có, thêm bằng CLI:**
```bash
gh secret set DEPLOY_SSH_KEY --repo <owner>/home-bizgenie < private_key_file
```

### 5. ✅ Workflow file syntax đúng

**Kiểm tra syntax:**
- File phải có extension `.yml` hoặc `.yaml`
- File phải có cấu trúc:
  ```yaml
  name: Deploy Production
  
  on:
    push:
      tags:
        - 'v*'
  
  jobs:
    deploy:
      ...
  ```

### 6. ✅ Tag được push từ đúng branch

**Quan trọng:** Workflow file phải tồn tại trong branch mà tag được tạo.

**Kiểm tra:**
```bash
# Xem tag đang ở branch nào
git show-ref --tags

# Xem workflow file có trong branch không
git ls-tree -r <branch-name> --name-only | grep ".github/workflows"
```

**Nếu workflow file chỉ có trong branch khác:**
```bash
# Merge workflow file vào branch có tag
git checkout main  # hoặc branch có tag
git merge develop   # hoặc branch có workflow file
git push origin main
```

## Các lỗi thường gặp

### Lỗi: "Workflow run not found"

**Nguyên nhân:** Tag chưa được push hoặc workflow file chưa có trong branch.

**Giải pháp:**
1. Đảm bảo workflow file đã được commit và push
2. Đảm bảo tag đã được push: `git push origin <tag-name>`

### Lỗi: "No jobs were run"

**Nguyên nhân:** Trigger pattern không khớp với tag.

**Giải pháp:**
- Kiểm tra tag có bắt đầu bằng `v` không
- Kiểm tra pattern trong workflow: `tags: - 'v*'`

### Lỗi: "Secret not found"

**Nguyên nhân:** `DEPLOY_SSH_KEY` chưa được thêm hoặc tên sai.

**Giải pháp:**
1. Kiểm tra tên secret chính xác: `DEPLOY_SSH_KEY`
2. Thêm lại secret nếu cần

### Lỗi: "SSH connection failed"

**Nguyên nhân:** SSH key không đúng hoặc server không accessible.

**Giải pháp:**
1. Kiểm tra SSH key đã được thêm vào `~/.ssh/authorized_keys` trên server
2. Kiểm tra server có thể truy cập: `ping 103.195.240.89`
3. Test SSH connection: `ssh root@103.195.240.89`

## Debug workflow

### Xem logs workflow

1. Vào repository → **Actions** tab
2. Chọn workflow run
3. Xem logs từng step

### Test workflow manually

Có thể trigger workflow thủ công bằng cách:
1. Vào **Actions** tab
2. Chọn workflow "Deploy Production"
3. Click "Run workflow"
4. Chọn branch và tag

### Kiểm tra workflow syntax online

Sử dụng các tool online để validate YAML:
- https://www.yamllint.com/
- https://github.com/schema/sts

## Quick fix commands

```bash
# 1. Đảm bảo workflow file đã commit
git add .github/workflows/deploy-production.yml
git commit -m "feat(ci): thêm GitHub Actions workflow"
git push origin main

# 2. Tạo và push tag
git tag -a v1.0.1 -m "Release 1.0.1"
git push origin v1.0.1

# 3. Kiểm tra tag đã push
git ls-remote --tags origin | grep "v1.0.1"

# 4. Kiểm tra workflow file có trong branch
git ls-tree -r main --name-only | grep ".github"
```

## Liên hệ hỗ trợ

Nếu vẫn không hoạt động sau khi kiểm tra tất cả các bước trên:
1. Xem logs chi tiết trong GitHub Actions
2. Kiểm tra GitHub Actions status page: https://www.githubstatus.com/
3. Kiểm tra repository permissions và settings
