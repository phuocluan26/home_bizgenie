# Script kiểm tra GitHub Actions bằng gh CLI
Write-Host "=== Kiểm tra GitHub Actions Status ===" -ForegroundColor Cyan
Write-Host ""

# Lấy owner
try {
    $owner = gh api user --jq .login 2>&1 | Out-String
    $owner = $owner.Trim()
    if ($owner -and $LASTEXITCODE -eq 0) {
        Write-Host "Repository owner: $owner" -ForegroundColor Green
        $repo = "$owner/home-bizgenie"
    } else {
        Write-Host "❌ Không thể lấy thông tin owner. Kiểm tra: gh auth login" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Lỗi khi lấy thông tin owner: $_" -ForegroundColor Red
    exit 1
}

Write-Host "Repository: $repo" -ForegroundColor Cyan
Write-Host ""

# 1. Kiểm tra repository
Write-Host "1. Kiểm tra repository..." -ForegroundColor Yellow
try {
    $repoInfo = gh repo view $repo --json name,owner,defaultBranch 2>&1 | ConvertFrom-Json
    Write-Host "   ✅ Repository tồn tại" -ForegroundColor Green
    Write-Host "   Name: $($repoInfo.name)" -ForegroundColor Gray
    Write-Host "   Owner: $($repoInfo.owner.login)" -ForegroundColor Gray
    Write-Host "   Default branch: $($repoInfo.defaultBranch)" -ForegroundColor Gray
} catch {
    Write-Host "   ❌ Không thể truy cập repository: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# 2. Kiểm tra workflows
Write-Host "2. Kiểm tra workflows..." -ForegroundColor Yellow
try {
    $workflows = gh workflow list --repo $repo --json name,state,path 2>&1 | ConvertFrom-Json
    if ($workflows) {
        Write-Host "   ✅ Có $($workflows.Count) workflow(s):" -ForegroundColor Green
        foreach ($wf in $workflows) {
            $status = if ($wf.state -eq "active") { "✅ Active" } else { "⚠️  $($wf.state)" }
            Write-Host "   - $($wf.name) ($status)" -ForegroundColor Gray
            Write-Host "     Path: $($wf.path)" -ForegroundColor DarkGray
        }
        
        $deployWorkflow = $workflows | Where-Object { $_.name -eq "Deploy Production" }
        if ($deployWorkflow) {
            Write-Host "   ✅ Workflow 'Deploy Production' đã được tìm thấy!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Workflow 'Deploy Production' không tồn tại!" -ForegroundColor Red
            Write-Host "   Cần commit và push file .github/workflows/deploy-production.yml" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Không có workflow nào" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Lỗi khi kiểm tra workflows: $_" -ForegroundColor Red
}

Write-Host ""

# 3. Kiểm tra workflow runs
Write-Host "3. Kiểm tra workflow runs (10 runs gần nhất)..." -ForegroundColor Yellow
try {
    $runs = gh run list --repo $repo --limit 10 --json status,conclusion,workflowName,event,headBranch,createdAt 2>&1 | ConvertFrom-Json
    if ($runs -and $runs.Count -gt 0) {
        Write-Host "   ✅ Có $($runs.Count) workflow run(s):" -ForegroundColor Green
        foreach ($run in $runs) {
            $statusIcon = switch ($run.status) {
                "completed" { if ($run.conclusion -eq "success") { "✅" } else { "❌" } }
                "in_progress" { "🔄" }
                "queued" { "⏳" }
                default { "⚠️" }
            }
            $conclusion = if ($run.conclusion) { "($($run.conclusion))" } else { "" }
            Write-Host "   $statusIcon $($run.workflowName) - $($run.event) - $($run.status) $conclusion" -ForegroundColor Gray
            Write-Host "     Branch: $($run.headBranch) - $($run.createdAt)" -ForegroundColor DarkGray
        }
    } else {
        Write-Host "   ⚠️  Chưa có workflow run nào" -ForegroundColor Yellow
        Write-Host "   Có thể do:" -ForegroundColor Yellow
        Write-Host "   - Chưa push tag bắt đầu bằng 'v'" -ForegroundColor Gray
        Write-Host "   - Workflow file chưa được commit/push" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Lỗi khi kiểm tra runs: $_" -ForegroundColor Red
}

Write-Host ""

# 4. Kiểm tra secrets
Write-Host "4. Kiểm tra secrets..." -ForegroundColor Yellow
try {
    $secrets = gh secret list --repo $repo --json name,updatedAt 2>&1 | ConvertFrom-Json
    if ($secrets -and $secrets.Count -gt 0) {
        Write-Host "   ✅ Có $($secrets.Count) secret(s):" -ForegroundColor Green
        foreach ($secret in $secrets) {
            Write-Host "   - $($secret.name) (updated: $($secret.updatedAt))" -ForegroundColor Gray
        }
        
        $deployKey = $secrets | Where-Object { $_.name -eq "DEPLOY_SSH_KEY" }
        if ($deployKey) {
            Write-Host "   ✅ DEPLOY_SSH_KEY đã được thêm!" -ForegroundColor Green
        } else {
            Write-Host "   ❌ DEPLOY_SSH_KEY chưa được thêm!" -ForegroundColor Red
            Write-Host "   Thêm bằng: gh secret set DEPLOY_SSH_KEY --repo $repo" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Không có secret nào" -ForegroundColor Yellow
        Write-Host "   ❌ DEPLOY_SSH_KEY chưa được thêm!" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Lỗi khi kiểm tra secrets: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Kiểm tra tags trên remote
Write-Host "5. Kiểm tra tags trên remote..." -ForegroundColor Yellow
try {
    $tags = git ls-remote --tags origin "refs/tags/v*" 2>&1
    if ($tags) {
        $tagList = $tags | ForEach-Object { 
            if ($_ -match "refs/tags/(.+)") { 
                $matches[1] 
            } 
        }
        if ($tagList) {
            Write-Host "   ✅ Có $($tagList.Count) tag(s) bắt đầu bằng 'v':" -ForegroundColor Green
            $tagList | ForEach-Object { Write-Host "   - $_" -ForegroundColor Gray }
        } else {
            Write-Host "   ⚠️  Không có tag nào bắt đầu bằng 'v'" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⚠️  Không có tag nào trên remote" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Lỗi khi kiểm tra tags: $_" -ForegroundColor Red
}

Write-Host ""

# 6. Kiểm tra workflow file trên remote
Write-Host "6. Kiểm tra workflow file trên remote..." -ForegroundColor Yellow
try {
    $defaultBranch = $repoInfo.defaultBranch
    $workflowExists = git ls-tree -r origin/$defaultBranch --name-only 2>&1 | Select-String ".github/workflows/deploy-production.yml"
    if ($workflowExists) {
        Write-Host "   ✅ Workflow file đã có trên remote branch '$defaultBranch'" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Workflow file chưa có trên remote branch '$defaultBranch'" -ForegroundColor Red
        Write-Host "   Cần commit và push file .github/workflows/deploy-production.yml" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Không thể kiểm tra workflow file trên remote" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Tóm tắt ===" -ForegroundColor Cyan
Write-Host "Để workflow hoạt động, cần:" -ForegroundColor Yellow
Write-Host "1. ✅ Workflow file đã được commit và push" -ForegroundColor $(if ($workflowExists) { "Green" } else { "Red" })
Write-Host "2. ✅ DEPLOY_SSH_KEY đã được thêm" -ForegroundColor $(if ($deployKey) { "Green" } else { "Red" })
Write-Host "3. ✅ Tag bắt đầu bằng 'v' đã được push" -ForegroundColor $(if ($tagList) { "Green" } else { "Yellow" })
Write-Host ""
Write-Host "Kiểm tra trên GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/$repo/actions" -ForegroundColor Blue
