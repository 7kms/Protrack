# PostgreSQL Data Backup and Import Guide

This document provides comprehensive instructions for backing up and importing PostgreSQL data in the ProTrack system, covering both Docker and native PostgreSQL deployments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Docker Environment Backup](#docker-environment-backup)
3. [Native PostgreSQL Backup](#native-postgresql-backup)
4. [Data Import/Restoration](#data-importrestoration)
5. [Automated Backup Scripts](#automated-backup-scripts)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### For Docker Environment

- Docker and Docker Compose installed
- ProTrack containers running
- Access to the Docker host system

### For Native PostgreSQL

- PostgreSQL client tools installed (`pg_dump`, `pg_restore`, `psql`)
- Database connection credentials
- Appropriate permissions to access the database

## Docker Environment Backup

### 1. SQL Dump Backup (Recommended)

#### Create a complete database backup:

```bash
# Create backup directory
mkdir -p ./backups

# Generate SQL dump with timestamp
docker exec -t protrack-db-1 pg_dump -U postgres -d protrack > ./backups/protrack_backup_$(date +%Y%m%d_%H%M%S).sql

# Or with compression
docker exec -t protrack-db-1 pg_dump -U postgres -d protrack | gzip > ./backups/protrack_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Create schema-only backup:

```bash
docker exec -t protrack-db-1 pg_dump -U postgres -d protrack --schema-only > ./backups/protrack_schema_$(date +%Y%m%d_%H%M%S).sql
```

#### Create data-only backup:

```bash
docker exec -t protrack-db-1 pg_dump -U postgres -d protrack --data-only > ./backups/protrack_data_$(date +%Y%m%d_%H%M%S).sql
```

### 2. Custom Format Backup

#### Create custom format backup (smaller, faster):

```bash
docker exec -t protrack-db-1 pg_dump -U postgres -d protrack -Fc > ./backups/protrack_backup_$(date +%Y%m%d_%H%M%S).dump
```

### 3. Directory Format Backup

#### Create directory format backup (parallel processing):

```bash
# Create backup directory
mkdir -p ./backups/protrack_dir_$(date +%Y%m%d_%H%M%S)

# Create directory format backup
docker exec -t protrack-db-1 pg_dump -U postgres -d protrack -Fd -f /tmp/backup_dir
docker cp protrack-db-1:/tmp/backup_dir ./backups/protrack_dir_$(date +%Y%m%d_%H%M%S)
```

### 4. Docker Volume Backup

#### Backup the entire PostgreSQL data directory:

```bash
# Stop the database container
docker-compose stop db

# Create a backup of the volume
docker run --rm -v protrack_postgres_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/postgres_volume_$(date +%Y%m%d_%H%M%S).tar.gz -C /data .

# Restart the database container
docker-compose start db
```

## Native PostgreSQL Backup

### 1. SQL Dump Backup

#### Environment variables (set these first):

```bash
export PGHOST=localhost
export PGPORT=5432
export PGUSER=postgres
export PGPASSWORD=your_password
export PGDATABASE=protrack
```

#### Create complete backup:

```bash
# Create backup directory
mkdir -p ./backups

# Generate SQL dump
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE > ./backups/protrack_backup_$(date +%Y%m%d_%H%M%S).sql

# With compression
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE | gzip > ./backups/protrack_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. Custom Format Backup

```bash
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -Fc > ./backups/protrack_backup_$(date +%Y%m%d_%H%M%S).dump
```

### 3. Specific Table Backup

```bash
# Backup specific tables
pg_dump -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE -t users -t projects -t tasks > ./backups/protrack_tables_$(date +%Y%m%d_%H%M%S).sql
```

## Data Import/Restoration

### Docker Environment Restoration

#### 1. Restore from SQL dump:

```bash
# Copy backup file to container
docker cp ./backups/protrack_backup_20240101_120000.sql protrack-db-1:/tmp/

# Restore the database
docker exec -i protrack-db-1 psql -U postgres -d protrack < /tmp/protrack_backup_20240101_120000.sql

# Or restore compressed backup
gunzip -c ./backups/protrack_backup_20240101_120000.sql.gz | docker exec -i protrack-db-1 psql -U postgres -d protrack
```

#### 2. Restore from custom format:

```bash
# Copy backup file to container
docker cp ./backups/protrack_backup_20240101_120000.dump protrack-db-1:/tmp/

# Restore using pg_restore
docker exec -i protrack-db-1 pg_restore -U postgres -d protrack -v /tmp/protrack_backup_20240101_120000.dump
```

#### 3. Complete database recreation:

```bash
# Stop the application
docker-compose down

# Remove existing data
docker volume rm protrack_postgres_data

# Start only the database
docker-compose up -d db

# Wait for database to be ready
sleep 10

# Restore the backup
gunzip -c ./backups/protrack_backup_20240101_120000.sql.gz | docker exec -i protrack-db-1 psql -U postgres -d protrack

# Start the full application
docker-compose up -d
```

### Native PostgreSQL Restoration

#### 1. Restore from SQL dump:

```bash
# Drop existing database (optional)
dropdb -h $PGHOST -p $PGPORT -U $PGUSER protrack

# Create new database
createdb -h $PGHOST -p $PGPORT -U $PGUSER protrack

# Restore from backup
psql -h $PGHOST -p $PGPORT -U $PGUSER -d protrack < ./backups/protrack_backup_20240101_120000.sql

# Or restore compressed backup
gunzip -c ./backups/protrack_backup_20240101_120000.sql.gz | psql -h $PGHOST -p $PGPORT -U $PGUSER -d protrack
```

#### 2. Restore from custom format:

```bash
pg_restore -h $PGHOST -p $PGPORT -U $PGUSER -d protrack -v ./backups/protrack_backup_20240101_120000.dump
```

#### 3. Restore specific tables:

```bash
pg_restore -h $PGHOST -p $PGPORT -U $PGUSER -d protrack -t users -t projects ./backups/protrack_backup_20240101_120000.dump
```

## Automated Backup Scripts

### Docker Backup Script

Create `scripts/backup-docker.sh`:

```bash
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
```

### Native PostgreSQL Backup Script

Create `scripts/backup-native.sh`:

```bash
#!/bin/bash

# Configuration
BACKUP_DIR="./backups"
PGHOST=${PGHOST:-localhost}
PGPORT=${PGPORT:-5432}
PGUSER=${PGUSER:-postgres}
PGDATABASE=${PGDATABASE:-protrack}
RETENTION_DAYS=7

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create backup filename
BACKUP_FILE="$BACKUP_DIR/protrack_backup_$TIMESTAMP.sql.gz"

# Create backup
echo "Creating backup: $BACKUP_FILE"
pg_dump -h "$PGHOST" -p "$PGPORT" -U "$PGUSER" -d "$PGDATABASE" | gzip > "$BACKUP_FILE"

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
```

### Make scripts executable:

```bash
chmod +x scripts/backup-docker.sh
chmod +x scripts/backup-native.sh
```

### Set up cron job for automated backups:

```bash
# Edit crontab
crontab -e

# Add entries for daily backups at 2 AM
0 2 * * * /path/to/protrack/scripts/backup-docker.sh >> /var/log/protrack-backup.log 2>&1
```

## Best Practices

### 1. Regular Backup Schedule

- **Daily backups**: For production environments
- **Weekly backups**: For development environments
- **Before major updates**: Always backup before deploying changes

### 2. Backup Validation

Always verify your backups:

```bash
# Test restore to a temporary database
docker exec -i protrack-db-1 createdb -U postgres protrack_test
gunzip -c ./backups/protrack_backup_20240101_120000.sql.gz | docker exec -i protrack-db-1 psql -U postgres -d protrack_test
docker exec -i protrack-db-1 dropdb -U postgres protrack_test
```

### 3. Storage Considerations

- **Local storage**: Keep recent backups locally
- **Remote storage**: Upload backups to cloud storage (AWS S3, Google Cloud Storage)
- **Encryption**: Encrypt sensitive backup files

### 4. Monitoring

- Log all backup operations
- Set up alerts for backup failures
- Monitor backup file sizes for anomalies

### 5. Documentation

- Document your backup procedures
- Keep a backup schedule record
- Document restoration procedures

## Troubleshooting

### Common Issues

#### 1. Permission Denied

```bash
# Docker: Ensure proper permissions
docker exec -it protrack-db-1 chown postgres:postgres /tmp/backup_file.sql

# Native: Check PostgreSQL user permissions
GRANT ALL PRIVILEGES ON DATABASE protrack TO postgres;
```

#### 2. Connection Refused

```bash
# Docker: Check if container is running
docker ps | grep protrack-db

# Native: Check PostgreSQL service
systemctl status postgresql
```

#### 3. Out of Disk Space

```bash
# Check disk usage
df -h

# Clean up old backups
find ./backups -name "*.sql.gz" -mtime +30 -delete
```

#### 4. Backup Corruption

```bash
# Test backup integrity
gunzip -t ./backups/protrack_backup_20240101_120000.sql.gz

# Verify SQL syntax
gunzip -c ./backups/protrack_backup_20240101_120000.sql.gz | head -100
```

### Recovery Scenarios

#### 1. Partial Data Loss

```bash
# Restore specific tables
pg_restore -h $PGHOST -p $PGPORT -U $PGUSER -d protrack -t users ./backups/protrack_backup.dump
```

#### 2. Complete Database Loss

```bash
# Full database restoration
dropdb -h $PGHOST -p $PGPORT -U $PGUSER protrack
createdb -h $PGHOST -p $PGPORT -U $PGUSER protrack
gunzip -c ./backups/protrack_backup_latest.sql.gz | psql -h $PGHOST -p $PGPORT -U $PGUSER -d protrack
```

#### 3. Point-in-Time Recovery

For point-in-time recovery, you would need to set up continuous archiving. This is beyond the scope of this document but involves:

- Setting up WAL archiving
- Taking base backups
- Restoring to a specific point in time

## Security Considerations

1. **Encrypt backups** containing sensitive data
2. **Restrict access** to backup files
3. **Use strong passwords** for database users
4. **Rotate backup encryption keys** regularly
5. **Audit backup access** and operations

## Conclusion

Regular backups are essential for data safety. Choose the backup method that best fits your deployment strategy and always test your restoration procedures before you need them in an emergency.

For questions or issues with backup procedures, consult the PostgreSQL documentation or your system administrator.
