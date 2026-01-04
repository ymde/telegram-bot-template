#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

log() {
    echo -e "${BLUE}[PROD]${NC} $1"
}

success() {
    echo -e "${GREEN}[PROD]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[PROD]${NC} $1"
}

error() {
    echo -e "${RED}[PROD]${NC} $1"
}

# Check if .env exists
if [ ! -f .env ]; then
    error ".env file not found!"
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Parse arguments
SKIP_MIGRATIONS=false
REBUILD=false
RESTART_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --skip-migrations)
            SKIP_MIGRATIONS=true
            shift
            ;;
        --rebuild)
            REBUILD=true
            shift
            ;;
        --restart)
            RESTART_ONLY=true
            shift
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --skip-migrations  Skip database migrations"
            echo "  --rebuild          Force rebuild even if dist exists"
            echo "  --restart          Only restart the application (skip migrations and build)"
            echo "  -h, --help         Show this help message"
            exit 0
            ;;
        *)
            error "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Restart only mode
if [ "$RESTART_ONLY" = true ]; then
    log "Restarting application..."
    docker compose restart
    success "Application restarted!"
    exit 0
fi

# Ensure containers are running
log "Ensuring Docker containers are running..."
docker compose up -d

# Wait for databases to be ready
log "Waiting for databases to be ready..."

# MariaDB
until docker compose exec -T database mariadb -u"$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "SELECT 1" &>/dev/null; do
    sleep 1
done
success "MariaDB is ready!"

# ClickHouse
until curl -s "http://localhost:${CLICKHOUSE_HTTP_PORT}/ping" &>/dev/null; do
    sleep 1
done
success "ClickHouse is ready!"

# Run migrations
if [ "$SKIP_MIGRATIONS" = false ]; then
    log "Running Prisma migrations..."
    yarn prisma migrate deploy

    log "Running ClickHouse migrations..."
    if command -v dbmate &>/dev/null; then
        cd db/clickhouse
        dbmate --url "$CLICKHOUSE_URL" up
        cd "$PROJECT_DIR"
    else
        warn "dbmate not installed. Skipping ClickHouse migrations..."
    fi

    success "Migrations completed!"
else
    warn "Skipping migrations (--skip-migrations flag)"
fi

# Build the application
if [ "$REBUILD" = true ] || [ ! -d dist ]; then
    log "Building application..."
    yarn build
    success "Build completed!"
else
    log "Dist folder exists, skipping build (use --rebuild to force)"
fi

# Generate Prisma client (in case schema changed)
log "Generating Prisma client..."
yarn prisma generate

success "Deployment completed!"
echo ""
log "Starting application..."
echo ""

# Start the application
exec yarn start
