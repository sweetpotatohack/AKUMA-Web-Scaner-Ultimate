#!/bin/bash

# AKUMA Web Scanner Backup Script
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backups/backup_$DATE"

echo "🗄️  Creating backup: backup_$DATE"

# Create backup directory
mkdir -p $BACKUP_DIR

# Copy configuration files
cp docker-compose.yml $BACKUP_DIR/
cp .env $BACKUP_DIR/ 2>/dev/null || true
cp -r backend $BACKUP_DIR/
cp -r frontend $BACKUP_DIR/
cp -r docs $BACKUP_DIR/
cp README.md $BACKUP_DIR/

# Copy reports if they exist
if [ -d "reports" ]; then
    cp -r reports $BACKUP_DIR/
fi

# Copy logs if they exist
if [ -d "logs" ]; then
    cp -r logs $BACKUP_DIR/
fi

# Create compressed archive
tar -czf "backups/akuma_backup_$DATE.tar.gz" -C backups "backup_$DATE"

# Remove temporary directory
rm -rf $BACKUP_DIR

echo "✅ Backup created: backups/akuma_backup_$DATE.tar.gz"

# Keep only last 5 backups
ls -t backups/akuma_backup_*.tar.gz | tail -n +6 | xargs -r rm

echo "🧹 Old backups cleaned up"
