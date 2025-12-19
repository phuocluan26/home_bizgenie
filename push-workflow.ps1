# Script de commit va push workflow file
Write-Host "Dang commit va push workflow file..." -ForegroundColor Yellow
Write-Host ""

$workflowFile = ".github\workflows\deploy-production.yml"

# Kiem tra file co ton tai khong
if (-not (Test-Path $workflowFile)) {
    Write-Host "Loi: Khong tim thay file $workflowFile" -ForegroundColor Red
    exit 1
}

Write-Host "File ton tai: $workflowFile" -ForegroundColor Green

# Kiem tra git status
Write-Host "`nKiem tra git status..." -ForegroundColor Yellow
$status = git status --porcelain $workflowFile
if ($status) {
    Write-Host "File co thay doi hoac chua duoc track" -ForegroundColor Yellow
    Write-Host "Status: $status" -ForegroundColor Gray
} else {
    Write-Host "File da duoc commit" -ForegroundColor Green
}

# Add file
Write-Host "`nDang add file..." -ForegroundColor Yellow
git add $workflowFile
if ($LASTEXITCODE -eq 0) {
    Write-Host "Da add file" -ForegroundColor Green
} else {
    Write-Host "Loi khi add file" -ForegroundColor Red
    exit 1
}

# Commit
Write-Host "`nDang commit..." -ForegroundColor Yellow
$commitMsg = "feat(ci): them GitHub Actions workflow deploy production"
git commit -m $commitMsg
if ($LASTEXITCODE -eq 0) {
    Write-Host "Da commit thanh cong" -ForegroundColor Green
} else {
    Write-Host "Co the file da duoc commit roi hoac khong co thay doi" -ForegroundColor Yellow
}

# Lay branch hien tai
$branch = git branch --show-current
if (-not $branch) {
    $branch = git rev-parse --abbrev-ref HEAD
}

Write-Host "`nBranch hien tai: $branch" -ForegroundColor Cyan

# Push
Write-Host "`nDang push len remote..." -ForegroundColor Yellow
git push origin $branch
if ($LASTEXITCODE -eq 0) {
    Write-Host "Da push thanh cong!" -ForegroundColor Green
} else {
    Write-Host "Loi khi push. Co the can:" -ForegroundColor Red
    Write-Host "  - git pull origin $branch" -ForegroundColor Yellow
    Write-Host "  - git push origin $branch" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nKiem tra workflow tren GitHub..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
$workflows = gh workflow list --repo dongocquy/home-bizgenie 2>&1
if ($workflows) {
    Write-Host $workflows
    $deployWorkflow = $workflows | Select-String "Deploy Production"
    if ($deployWorkflow) {
        Write-Host "`nWorkflow 'Deploy Production' da duoc them thanh cong!" -ForegroundColor Green
    }
} else {
    Write-Host "Chua thay workflow. Co the can doi mot chut de GitHub cap nhat." -ForegroundColor Yellow
}

Write-Host "`nKiem tra tren GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/dongocquy/home-bizgenie/actions" -ForegroundColor Blue
