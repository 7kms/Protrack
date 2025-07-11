#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
CONTAINER_NAME="protrack-db-1"
DATABASE_NAME="protrack"
DATABASE_USER="postgres"
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/protrack_backup_$TIMESTAMP.sql.gz"

# Create backup
echo "Creating backup: $BACKUP_FILE"
docker exec -t "$CONTAINER_NAME" pg_dump -U "$DATABASE_USER" -d "$DATABASE_NAME" | gzip > "$BACKUP_FILE"

# Check if backup was successful
if [ $? -eq 0 ]; then
    echo "Backup created successfully: $BACKUP_FILE"
    
    # Remove old backups
    find "$BACKUP_DIR" -name "protrack_backup_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
    echo "Old backups removed (older than $RETENTION_DAYS days)"
else
    echo "Backup failed!"
    exit 1
fi 