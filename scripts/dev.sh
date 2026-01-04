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
    echo -e "${BLUE}[DEV]${NC} $1"
}

success() {
    echo -e "${GREEN}[DEV]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[DEV]${NC} $1"
}

error() {
    echo -e "${RED}[DEV]${NC} $1"
}

# Check if .env exists
if [ ! -f .env ]; then
    error ".env file not found!"
    log "Copying from .env.example..."
    cp .env.example .env
    warn "Please update .env with your configuration and run again."
    exit 1
fi

# Load environment variables
set -a
source .env
set +a

# Start Docker containers
log "Starting Docker containers..."
docker compose up -d

echo "$DATABASE_URL"

# Wait for MariaDB to be ready
log "Waiting for MariaDB to be ready..."
until docker compose exec -T database mariadb -u"$DATABASE_USER" -p"$DATABASE_PASSWORD" -e "SELECT 1" &>/dev/null; do
    sleep 1
done
success "MariaDB is ready!"

# Wait for ClickHouse to be ready
log "Waiting for ClickHouse to be ready..."
until curl -s "http://localhost:${CLICKHOUSE_HTTP_PORT}/ping" &>/dev/null; do
    sleep 1
done
success "ClickHouse is ready!"

# Wait for Redis to be ready
log "Waiting for Redis to be ready..."
until docker compose exec -T redis redis-cli ping &>/dev/null; do
    sleep 1
done
success "Redis is ready!"

# Install dependencies if needed
if [ ! -d node_modules ]; then
    log "Installing dependencies..."
    yarn install
fi

# Run Prisma migrations
log "Running Prisma migrations..."
yarn prisma migrate deploy

# Run ClickHouse migrations
log "Running ClickHouse migrations..."
if command -v dbmate &>/dev/null; then
    dbmate --url "$CLICKHOUSE_URL" --migrations-dir "./db/clickhouse/migrations" up
else
    warn "dbmate not installed. Install with: brew install dbmate"
    warn "Skipping ClickHouse migrations..."
fi

# Generate Prisma client
log "Generating Prisma client..."
yarn prisma generate

success "All services are ready!"
echo ""
log "Starting development server..."
echo ""

# Start the development watcher
exec yarn dev
