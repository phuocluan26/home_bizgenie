#!/bin/bash

# Docker Swarm Management Script
# Sử dụng: ./scripts/swarm-manager.sh [command]

set -e

STACK_NAME="bizgenie"
COMPOSE_FILE="docker-compose.swarm.yml"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Docker is running
check_docker() {
    if ! docker info > /dev/null 2>&1; then
        print_error "Docker is not running. Please start Docker first."
        exit 1
    fi
}

# Initialize Swarm
init_swarm() {
    print_info "Initializing Docker Swarm..."
    if docker info | grep -q "Swarm: active"; then
        print_warn "Swarm is already initialized"
    else
        docker swarm init
        print_info "Swarm initialized successfully"
        print_info "Use the command above to join worker nodes"
    fi
}

# Deploy stack
deploy_stack() {
    check_docker
    
    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Compose file not found: $COMPOSE_FILE"
        exit 1
    fi
    
    print_info "Deploying stack: $STACK_NAME"
    docker stack deploy -c "$COMPOSE_FILE" "$STACK_NAME"
    print_info "Stack deployed. Use 'status' command to check services"
}

# Remove stack
remove_stack() {
    check_docker
    print_warn "Removing stack: $STACK_NAME"
    read -p "Are you sure? (y/N) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker stack rm "$STACK_NAME"
        print_info "Stack removal initiated"
    else
        print_info "Cancelled"
    fi
}

# Show stack status
show_status() {
    check_docker
    print_info "Stack: $STACK_NAME"
    echo
    print_info "Services:"
    docker stack services "$STACK_NAME"
    echo
    print_info "Tasks:"
    docker stack ps "$STACK_NAME"
}

# Show service logs
show_logs() {
    check_docker
    SERVICE_NAME="$2"
    if [ -z "$SERVICE_NAME" ]; then
        print_error "Please specify service name"
        print_info "Available services:"
        docker stack services "$STACK_NAME" --format "{{.Name}}"
        exit 1
    fi
    
    print_info "Showing logs for: $SERVICE_NAME"
    docker service logs -f "${STACK_NAME}_${SERVICE_NAME}"
}

# Scale service
scale_service() {
    check_docker
    SERVICE_NAME="$2"
    REPLICAS="$3"
    
    if [ -z "$SERVICE_NAME" ] || [ -z "$REPLICAS" ]; then
        print_error "Usage: scale <service-name> <replicas>"
        exit 1
    fi
    
    print_info "Scaling ${STACK_NAME}_${SERVICE_NAME} to $REPLICAS replicas"
    docker service scale "${STACK_NAME}_${SERVICE_NAME}=$REPLICAS"
}

# Update service
update_service() {
    check_docker
    SERVICE_NAME="$2"
    
    if [ -z "$SERVICE_NAME" ]; then
        print_error "Usage: update <service-name>"
        exit 1
    fi
    
    print_info "Updating service: ${STACK_NAME}_${SERVICE_NAME}"
    docker service update --force "${STACK_NAME}_${SERVICE_NAME}"
}

# Show nodes
show_nodes() {
    check_docker
    print_info "Swarm Nodes:"
    docker node ls
}

# Show usage
show_usage() {
    echo "Docker Swarm Management Script"
    echo
    echo "Usage: $0 [command] [options]"
    echo
    echo "Commands:"
    echo "  init              Initialize Docker Swarm"
    echo "  deploy            Deploy stack"
    echo "  remove            Remove stack"
    echo "  status            Show stack status"
    echo "  logs <service>    Show service logs (use -f to follow)"
    echo "  scale <svc> <n>   Scale service to n replicas"
    echo "  update <service>  Force update service"
    echo "  nodes             Show swarm nodes"
    echo "  help              Show this help message"
    echo
    echo "Examples:"
    echo "  $0 init"
    echo "  $0 deploy"
    echo "  $0 status"
    echo "  $0 logs main-api"
    echo "  $0 scale main-api 3"
    echo "  $0 update main-api"
}

# Main script
case "$1" in
    init)
        init_swarm
        ;;
    deploy)
        deploy_stack
        ;;
    remove|rm)
        remove_stack
        ;;
    status|ps)
        show_status
        ;;
    logs)
        show_logs "$@"
        ;;
    scale)
        scale_service "$@"
        ;;
    update)
        update_service "$@"
        ;;
    nodes)
        show_nodes
        ;;
    help|--help|-h)
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        echo
        show_usage
        exit 1
        ;;
esac
