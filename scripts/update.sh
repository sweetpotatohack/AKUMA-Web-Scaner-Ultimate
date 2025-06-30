#!/bin/bash

# AKUMA Web Scanner Update Script
echo "🔄 AKUMA Web Scanner - Update Script"
echo "==================================="

# Stop running containers
echo "⏹️  Stopping containers..."
docker-compose down

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Rebuild containers
echo "🏗️  Rebuilding containers..."
docker-compose build --no-cache

# Start containers
echo "🚀 Starting updated containers..."
docker-compose up -d

# Wait for services
echo "⏳ Waiting for services..."
sleep 15

# Check status
if docker-compose ps | grep -q "Up"; then
    echo "✅ Update completed successfully!"
    echo "🌐 Services are running at:"
    echo "  Frontend: http://localhost:3001"
    echo "  Backend: http://localhost:8001"
else
    echo "❌ Update failed. Check logs with: docker-compose logs"
fi
