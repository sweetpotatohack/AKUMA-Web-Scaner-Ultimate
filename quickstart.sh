#!/bin/bash

# 🔥 AKUMA Web Scanner - Quick Start
# One-command installation and launch

echo "🔥 AKUMA Web Scanner - Quick Start"
echo "================================="

# Check if running in correct directory
if [ ! -f "docker-compose.yml" ]; then
    echo "❌ Error: docker-compose.yml not found"
    echo "Please run this script from the AKUMA_Web_Scanner directory"
    exit 1
fi

# Check Docker installation
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first:"
    echo "   https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not found. Please install Docker Compose first:"
    echo "   https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose found"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Clean up old containers and images
echo "🧹 Cleaning up old containers..."
docker container prune -f 2>/dev/null || true

# Build and start services
echo "🏗️  Building and starting services..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 15

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "🎉 AKUMA Web Scanner is ready!"
    echo "==============================="
    echo ""
    echo "🌐 Access your scanner:"
    echo "  📱 Web Interface: http://localhost:3001"
    echo "  🔗 API Endpoint:  http://localhost:8001"
    echo "  📚 API Docs:      http://localhost:8001/docs"
    echo ""
    echo "🔧 Useful commands:"
    echo "  📊 View logs:     docker-compose logs -f"
    echo "  🛑 Stop scanner:  docker-compose down"
    echo "  🔄 Restart:       docker-compose restart"
    echo "  📋 Status:        docker-compose ps"
    echo ""
    echo "📖 Documentation:"
    echo "  📝 README:        cat README.md"
    echo "  🚀 Install Guide: cat docs/INSTALLATION_GUIDE.md"
    echo "  🌐 Deploy Guide:  cat docs/DEPLOYMENT_GUIDE.md"
    echo ""
    echo "🎯 Ready to scan! Open http://localhost:3001 in your browser"
    echo ""
else
    echo "❌ Failed to start services"
    echo ""
    echo "🔍 Troubleshooting:"
    echo "  📋 Check status:  docker-compose ps"
    echo "  📊 View logs:     docker-compose logs"
    echo "  🔄 Try again:     docker-compose down && docker-compose up --build"
    echo ""
    echo "💡 Common issues:"
    echo "  • Ports 3001/8001 already in use"
    echo "  • Not enough memory/disk space"
    echo "  • Docker daemon not running"
    exit 1
fi
