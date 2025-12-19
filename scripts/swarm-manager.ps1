# Docker Swarm Management Script for PowerShell
# Sử dụng: .\scripts\swarm-manager.ps1 [command]

param(
    [Parameter(Position=0)]
    [string]$Command = "help",
    
    [Parameter(Position=1)]
    [string]$ServiceName = "",
    
    [Parameter(Position=2)]
    [string]$Replicas = ""
)

$STACK_NAME = "bizgenie"
$COMPOSE_FILE = "docker-compose.swarm.yml"

# Helper functions
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Write-Warn {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if Docker is running
function Test-Docker {
    try {
        docker info | Out-Null
        return $true
    } catch {
        Write-Error "Docker is not running. Please start Docker first."
        exit 1
    }
}

# Initialize Swarm
function Initialize-Swarm {
    Write-Info "Initializing Docker Swarm..."
    $swarmStatus = docker info 2>&1 | Select-String "Swarm: active"
    if ($swarmStatus) {
        Write-Warn "Swarm is already initialized"
    } else {
        docker swarm init
        Write-Info "Swarm initialized successfully"
        Write-Info "Use the command above to join worker nodes"
    }
}

# Deploy stack
function Deploy-Stack {
    Test-Docker
    
    if (-not (Test-Path $COMPOSE_FILE)) {
        Write-Error "Compose file not found: $COMPOSE_FILE"
        exit 1
    }
    
    Write-Info "Deploying stack: $STACK_NAME"
    docker stack deploy -c $COMPOSE_FILE $STACK_NAME
    Write-Info "Stack deployed. Use 'status' command to check services"
}

# Remove stack
function Remove-Stack {
    Test-Docker
    Write-Warn "Removing stack: $STACK_NAME"
    $confirm = Read-Host "Are you sure? (y/N)"
    if ($confirm -eq "y" -or $confirm -eq "Y") {
        docker stack rm $STACK_NAME
        Write-Info "Stack removal initiated"
    } else {
        Write-Info "Cancelled"
    }
}

# Show stack status
function Show-Status {
    Test-Docker
    Write-Info "Stack: $STACK_NAME"
    Write-Host ""
    Write-Info "Services:"
    docker stack services $STACK_NAME
    Write-Host ""
    Write-Info "Tasks:"
    docker stack ps $STACK_NAME
}

# Show service logs
function Show-Logs {
    param([string]$Service)
    Test-Docker
    
    if ([string]::IsNullOrEmpty($Service)) {
        Write-Error "Please specify service name"
        Write-Info "Available services:"
        docker stack services $STACK_NAME --format "{{.Name}}"
        exit 1
    }
    
    Write-Info "Showing logs for: $Service"
    docker service logs -f "${STACK_NAME}_${Service}"
}

# Scale service
function Scale-Service {
    param([string]$Service, [string]$Replicas)
    Test-Docker
    
    if ([string]::IsNullOrEmpty($Service) -or [string]::IsNullOrEmpty($Replicas)) {
        Write-Error "Usage: scale <service-name> <replicas>"
        exit 1
    }
    
    Write-Info "Scaling ${STACK_NAME}_${Service} to $Replicas replicas"
    docker service scale "${STACK_NAME}_${Service}=$Replicas"
}

# Update service
function Update-Service {
    param([string]$Service)
    Test-Docker
    
    if ([string]::IsNullOrEmpty($Service)) {
        Write-Error "Usage: update <service-name>"
        exit 1
    }
    
    Write-Info "Updating service: ${STACK_NAME}_${Service}"
    docker service update --force "${STACK_NAME}_${Service}"
}

# Show nodes
function Show-Nodes {
    Test-Docker
    Write-Info "Swarm Nodes:"
    docker node ls
}

# Show usage
function Show-Usage {
    Write-Host "Docker Swarm Management Script"
    Write-Host ""
    Write-Host "Usage: .\scripts\swarm-manager.ps1 [command] [options]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  init              Initialize Docker Swarm"
    Write-Host "  deploy            Deploy stack"
    Write-Host "  remove            Remove stack"
    Write-Host "  status            Show stack status"
    Write-Host "  logs <service>    Show service logs"
    Write-Host "  scale <svc> <n>   Scale service to n replicas"
    Write-Host "  update <service>  Force update service"
    Write-Host "  nodes             Show swarm nodes"
    Write-Host "  help              Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\scripts\swarm-manager.ps1 init"
    Write-Host "  .\scripts\swarm-manager.ps1 deploy"
    Write-Host "  .\scripts\swarm-manager.ps1 status"
    Write-Host "  .\scripts\swarm-manager.ps1 logs main-api"
    Write-Host "  .\scripts\swarm-manager.ps1 scale main-api 3"
    Write-Host "  .\scripts\swarm-manager.ps1 update main-api"
}

# Main script
switch ($Command.ToLower()) {
    "init" {
        Initialize-Swarm
    }
    "deploy" {
        Deploy-Stack
    }
    "remove" {
        Remove-Stack
    }
    "rm" {
        Remove-Stack
    }
    "status" {
        Show-Status
    }
    "ps" {
        Show-Status
    }
    "logs" {
        Show-Logs -Service $ServiceName
    }
    "scale" {
        Scale-Service -Service $ServiceName -Replicas $Replicas
    }
    "update" {
        Update-Service -Service $ServiceName
    }
    "nodes" {
        Show-Nodes
    }
    "help" {
        Show-Usage
    }
    default {
        Write-Error "Unknown command: $Command"
        Write-Host ""
        Show-Usage
        exit 1
    }
}
