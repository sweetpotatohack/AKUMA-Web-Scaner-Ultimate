#!/bin/bash

# AKUMA Web Scanner Installation Script
echo "🔥 AKUMA Web Scanner - Installation Script"
echo "=========================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
mkdir -p reports logs backups ssl
chmod 755 reports logs backups ssl

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << 'ENVEOF'
# Backend settings
BACKEND_PORT=8001
DEBUG=false
LOG_LEVEL=INFO

# Frontend settings
FRONTEND_PORT=3001
REACT_APP_API_URL=http://localhost:8001

# Database settings
DATABASE_URL=sqlite:///./scanner.db

# Security settings
SECRET_KEY=akuma-web-scanner-secret-key-change-me
ALLOWED_HOSTS=localhost,127.0.0.1

# Scanner settings
MAX_CONCURRENT_SCANS=5
DEFAULT_TIMEOUT=15
MAX_TARGETS_PER_SCAN=100
ENVEOF
fi

# Build and start containers
echo "🏗️  Building Docker images..."
docker-compose build

echo "🚀 Starting containers..."
docker-compose up -d

# Wait for services to start
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access URLs:"
    echo "  Frontend: http://localhost:3001"
    echo "  Backend API: http://localhost:8001"
    echo "  API Docs: http://localhost:8001/docs"
    echo ""
    echo "🔧 Useful commands:"
    echo "  View logs: docker-compose logs -f"
    echo "  Stop: docker-compose down"
    echo "  Restart: docker-compose restart"
else
    echo "❌ Failed to start services"
    echo "Check logs with: docker-compose logs"
    exit 1
fi
