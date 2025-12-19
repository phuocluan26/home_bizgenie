# Script kiem tra GitHub Actions bang gh CLI
# Chay: .\check-github-actions.ps1

$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  KIEM TRA GITHUB ACTIONS STATUS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kiem tra gh CLI da cai dat chua
if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
    Write-Host "GitHub CLI (gh) chua duoc cai dat!" -ForegroundColor Red
    Write-Host "Cai dat: https://cli.github.com/" -ForegroundColor Yellow
    exit 1
}

# Kiem tra da dang nhap chua
try {
    $null = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Chua dang nhap GitHub CLI!" -ForegroundColor Red
        Write-Host "Dang nhap: gh auth login" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Chua dang nhap GitHub CLI!" -ForegroundColor Red
    Write-Host "Dang nhap: gh auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Da dang nhap GitHub CLI" -ForegroundColor Green
Write-Host ""

# Lay owner
Write-Host "Dang lay thong tin repository owner..." -ForegroundColor Yellow
try {
    $owner = gh api user --jq .login 2>&1
    $owner = $owner.ToString().Trim()
    if (-not $owner -or $owner -eq "") {
        Write-Host "Khong the lay thong tin owner" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Khong the lay thong tin owner" -ForegroundColor Red
    exit 1
}

$repo = "$owner/home-bizgenie"
Write-Host "Repository: $repo" -ForegroundColor Cyan
Write-Host ""

# 1. Kiem tra workflows
Write-Host "1. KIEM TRA WORKFLOWS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $workflowsOutput = gh workflow list --repo $repo 2>&1
    $workflows = $workflowsOutput | Out-String
    
    if ($workflows -and $workflows.Trim() -ne "") {
        Write-Host $workflows
        $deployWorkflow = $workflows | Select-String "Deploy Production"
        if ($deployWorkflow) {
            Write-Host "Workflow 'Deploy Production' da duoc tim thay!" -ForegroundColor Green
            $hasDeployWorkflow = $true
        } else {
            Write-Host "Workflow 'Deploy Production' khong ton tai!" -ForegroundColor Red
            Write-Host "   Can commit va push file .github/workflows/deploy-production.yml" -ForegroundColor Yellow
            $hasDeployWorkflow = $false
        }
    } else {
        Write-Host "Khong co workflow nao" -ForegroundColor Yellow
        $hasDeployWorkflow = $false
    }
} catch {
    Write-Host "Loi khi kiem tra workflows: $_" -ForegroundColor Red
    $hasDeployWorkflow = $false
}
Write-Host ""

# 2. Kiem tra workflow runs
Write-Host "2. KIEM TRA WORKFLOW RUNS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $runsOutput = gh run list --repo $repo --limit 10 2>&1
    $runs = $runsOutput | Out-String
    
    if ($runs -and $runs.Trim() -ne "") {
        Write-Host $runs
        $tagRuns = $runs | Select-String "push"
        if ($tagRuns) {
            Write-Host "Co workflow runs tu push" -ForegroundColor Green
        } else {
            Write-Host "Chua co workflow run nao tu tag push" -ForegroundColor Yellow
        }
    } else {
        Write-Host "Chua co workflow run nao" -ForegroundColor Yellow
        Write-Host "   Co the do:" -ForegroundColor Yellow
        Write-Host "   - Chua push tag bat dau bang 'v'" -ForegroundColor Gray
        Write-Host "   - Workflow file chua duoc commit/push" -ForegroundColor Gray
    }
} catch {
    Write-Host "Loi khi kiem tra runs: $_" -ForegroundColor Red
}
Write-Host ""

# 3. Kiem tra secrets
Write-Host "3. KIEM TRA SECRETS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $secretsOutput = gh secret list --repo $repo 2>&1
    $secrets = $secretsOutput | Out-String
    
    if ($secrets -and $secrets.Trim() -ne "") {
        Write-Host $secrets
        $deployKey = $secrets | Select-String "DEPLOY_SSH_KEY"
        if ($deployKey) {
            Write-Host "DEPLOY_SSH_KEY da duoc them!" -ForegroundColor Green
            $hasDeployKey = $true
        } else {
            Write-Host "DEPLOY_SSH_KEY chua duoc them!" -ForegroundColor Red
            Write-Host "   Them bang: gh secret set DEPLOY_SSH_KEY --repo $repo" -ForegroundColor Yellow
            $hasDeployKey = $false
        }
    } else {
        Write-Host "Khong co secret nao" -ForegroundColor Red
        Write-Host "   DEPLOY_SSH_KEY chua duoc them!" -ForegroundColor Red
        $hasDeployKey = $false
    }
} catch {
    Write-Host "Loi khi kiem tra secrets: $_" -ForegroundColor Red
    $hasDeployKey = $false
}
Write-Host ""

# 4. Kiem tra tags
Write-Host "4. KIEM TRA TAGS" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $tagsOutput = git ls-remote --tags origin 2>&1
    $tags = $tagsOutput | Select-String "refs/tags/v"
    
    if ($tags) {
        Write-Host "Co tags bat dau bang 'v':" -ForegroundColor Green
        $tags | ForEach-Object {
            if ($_ -match "refs/tags/(.+)") {
                Write-Host "   - $($matches[1])" -ForegroundColor Gray
            }
        }
        $hasTags = $true
    } else {
        Write-Host "Khong co tag nao bat dau bang 'v' tren remote" -ForegroundColor Yellow
        Write-Host "   Tao tag: git tag -a v1.0.0 -m 'Release 1.0.0'" -ForegroundColor Cyan
        Write-Host "   Push tag: git push origin v1.0.0" -ForegroundColor Cyan
        $hasTags = $false
    }
} catch {
    Write-Host "Loi khi kiem tra tags: $_" -ForegroundColor Red
    $hasTags = $false
}
Write-Host ""

# 5. Kiem tra workflow file tren remote
Write-Host "5. KIEM TRA WORKFLOW FILE TREN REMOTE" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
try {
    $defaultBranchOutput = gh repo view $repo --json defaultBranch --jq .defaultBranch 2>&1
    $defaultBranch = $defaultBranchOutput.ToString().Trim()
    
    if ($defaultBranch -and $defaultBranch -ne "") {
        $workflowFileOutput = git ls-tree -r "origin/$defaultBranch" --name-only 2>&1
        $workflowFile = $workflowFileOutput | Select-String ".github/workflows/deploy-production.yml"
        
        if ($workflowFile) {
            Write-Host "Workflow file da co tren remote branch '$defaultBranch'" -ForegroundColor Green
            $hasWorkflowFile = $true
        } else {
            Write-Host "Workflow file chua co tren remote branch '$defaultBranch'" -ForegroundColor Red
            Write-Host "   Can commit va push:" -ForegroundColor Yellow
            Write-Host "   git add .github/workflows/deploy-production.yml" -ForegroundColor Cyan
            Write-Host "   git commit -m 'feat(ci): them GitHub Actions workflow'" -ForegroundColor Cyan
            Write-Host "   git push origin $defaultBranch" -ForegroundColor Cyan
            $hasWorkflowFile = $false
        }
    } else {
        Write-Host "Khong the lay default branch" -ForegroundColor Red
        $hasWorkflowFile = $false
    }
} catch {
    Write-Host "Loi khi kiem tra workflow file: $_" -ForegroundColor Red
    $hasWorkflowFile = $false
}
Write-Host ""

# Tom tat
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TOM TAT" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "De workflow hoat dong, can:" -ForegroundColor Yellow
Write-Host ""

$allGood = $true

# Check 1
if ($hasDeployWorkflow) {
    Write-Host "Workflow 'Deploy Production' da ton tai" -ForegroundColor Green
} else {
    Write-Host "Workflow 'Deploy Production' chua ton tai" -ForegroundColor Red
    $allGood = $false
}

# Check 2
if ($hasWorkflowFile) {
    Write-Host "Workflow file da co tren remote" -ForegroundColor Green
} else {
    Write-Host "Workflow file chua co tren remote" -ForegroundColor Red
    $allGood = $false
}

# Check 3
if ($hasDeployKey) {
    Write-Host "DEPLOY_SSH_KEY da duoc them" -ForegroundColor Green
} else {
    Write-Host "DEPLOY_SSH_KEY chua duoc them" -ForegroundColor Red
    $allGood = $false
}

# Check 4
if ($hasTags) {
    Write-Host "Co tags bat dau bang 'v'" -ForegroundColor Green
} else {
    Write-Host "Chua co tag nao bat dau bang 'v'" -ForegroundColor Yellow
}

Write-Host ""
if ($allGood) {
    Write-Host "Tat ca dieu kien co ban da dap ung!" -ForegroundColor Green
    Write-Host "   Neu workflow van khong chay, kiem tra:" -ForegroundColor Yellow
    Write-Host "   - GitHub Actions da duoc enable trong repository settings" -ForegroundColor Gray
    Write-Host "   - Tag format dung (bat dau bang 'v')" -ForegroundColor Gray
} else {
    Write-Host "Con thieu mot so dieu kien. Vui long sua cac van de tren." -ForegroundColor Red
}

Write-Host ""
Write-Host "Kiem tra tren GitHub:" -ForegroundColor Cyan
Write-Host "https://github.com/$repo/actions" -ForegroundColor Blue
Write-Host "https://github.com/$repo/settings/secrets/actions" -ForegroundColor Blue
