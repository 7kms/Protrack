# Docker Setup Guide for ProTrack

This guide will help you set up and run ProTrack using Docker and Docker Compose.

## Prerequisites

- Docker installed on your system
- Docker Compose installed on your system
- Git (optional, for cloning the repository)

## Quick Start

1. Clone the repository (if you haven't already):

```bash
git clone <repository-url>
cd protrack
```

2. Create a `.env` file in the root directory with the following content:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/protrack"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

3. Start the application:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

## Updating the Application

After pulling updates from git, you need to properly rebuild the Docker image to incorporate code changes.

### ⚠️ Important: Don't Use `docker-compose restart`

**DO NOT** use `docker-compose restart` after pulling updates from git. This command only restarts the existing containers without rebuilding the image, meaning your code changes won't be applied.

### Proper Update Workflow

When you pull updates from git, follow these steps:

1. **Pull the latest changes:**

```bash
git pull origin main
```

2. **Rebuild and restart the containers:**

```bash
# Recommended: Rebuild and start
docker-compose up --build

# Or in detached mode (background)
docker-compose up --build -d
```

### Alternative Update Methods

Depending on your situation, you can use these alternative approaches:

**Method 1: Stop, then rebuild and start**

```bash
docker-compose down
docker-compose up --build
```

**Method 2: Force rebuild without cache (for troubleshooting)**

```bash
docker-compose build --no-cache
docker-compose up
```

**Method 3: Rebuild specific service only**

```bash
# If you only need to rebuild the app (not the database)
docker-compose up -d --build app
```

### When to Use Each Command

- **Use `docker-compose up --build`** - After pulling code updates (most common)
- **Use `docker-compose restart`** - Only for configuration changes that don't require rebuilding
- **Use `docker-compose build --no-cache`** - When experiencing caching issues or build problems
- **Use `docker-compose down && docker-compose up --build`** - For a clean restart with updates

### Quick Reference

```bash
# ✅ CORRECT: After git pull
git pull origin main
docker-compose up -d --build

```

## Detailed Setup Instructions

### 1. Environment Setup

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres@db:5432/protrack"

# Application Configuration
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV=production
```

### 2. Starting the Application

To start the application in development mode:

```bash
docker-compose up --build
```

To start in detached mode (in the background):

```bash
docker-compose up -d --build
```

### 3. Stopping the Application

To stop the application:

```bash
docker-compose down
```

To stop and remove volumes (this will delete all data):

```bash
docker-compose down -v
```

### 4. Database Management

The PostgreSQL database is automatically initialized when the containers start. The database credentials are:

- Host: db
- Port: 5432
- Database: protrack
- Username: postgres
- Password: postgres

### 5. Common Commands

View logs:

```bash
docker-compose logs -f
```

View logs for a specific service:

```bash
docker-compose logs -f app  # For the Next.js application
docker-compose logs -f db   # For the PostgreSQL database
```

Rebuild a specific service:

```bash
docker-compose up --build app
```

### 6. Troubleshooting

If you encounter any issues:

1. Check if the containers are running:

```bash
docker-compose ps
```

2. Check the logs for errors:

```bash
docker-compose logs
```

3. If the database isn't connecting:

   - Ensure the database container is running
   - Check if the database credentials in the `.env` file match the Docker Compose configuration
   - Try restarting the containers: `docker-compose restart`

4. If the application isn't starting:
   - Check if port 3000 is available
   - Verify the environment variables are set correctly
   - Try rebuilding the containers: `docker-compose up --build`

#### Common Docker Compose Errors

**Error: `KeyError: 'ContainerConfig'`**

This error occurs when Docker images have corrupted metadata or there are container state conflicts.

**Solution (try in order):**

1. **Quick cleanup:**

   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

2. **Medium cleanup:**

   ```bash
   docker-compose down -v
   docker image prune -f
   docker-compose up --build
   ```

3. **Complete cleanup (⚠️ removes all unused Docker data):**

   ```bash
   docker system prune -a --volumes
   docker-compose up --build
   ```

4. **Try Docker Compose V2:**
   ```bash
   docker-compose down -v
   docker compose up --build  # Note the space instead of hyphen
   ```

**Error: Port already in use**

```bash
# Find what's using port 3000
lsof -i :3000

# Stop the process or change the port in docker-compose.yml
```

**Error: Volume mount issues**

```bash
# Remove all volumes and start fresh
docker-compose down -v
docker volume prune -f
docker-compose up --build
```

### 7. Development Workflow

For development, the application supports hot-reloading. Any changes you make to the source code will be automatically reflected in the running container.

To apply database migrations:

```bash
docker-compose exec app pnpm db:migrate
```

To seed the database:

```bash
docker-compose exec app pnpm db:seed
```

## Automated Database Setup

The Docker setup includes automatic database initialization. When you start the containers, the following steps are automatically executed:

1. Wait for PostgreSQL to be ready
2. Create the database if it doesn't exist
3. Run database migrations
4. Seed the database with initial data
5. Start the application

This means you don't need to manually run any database setup commands. Everything is handled automatically when you start the containers with:

```bash
docker-compose up --build
```

### Database Initialization Process

The initialization process is handled by the `db/init-db.sh` script, which:

1. Waits for PostgreSQL to be ready using `pg_isready`
2. Creates the database if it doesn't exist
3. Runs migrations using `pnpm db:migrate`
4. Seeds the database using `pnpm db:seed`
5. Starts the application

### Health Checks

The setup includes health checks for the database:

- Checks if PostgreSQL is ready to accept connections
- Retries up to 5 times with 5-second intervals
- The application only starts after the database is confirmed to be healthy

### Manual Database Operations

If you need to perform manual database operations, you can:

1. Connect to the database container:

```bash
docker-compose exec db psql -U postgres -d protrack
```

2. Run specific database commands:

```bash
# Run migrations manually
docker-compose exec app pnpm db:migrate

# Seed the database manually
docker-compose exec app pnpm db:seed

# Update task dates
docker-compose exec app pnpm db:update-dates
```

## Architecture

The Docker setup consists of two main services:

1. **app**: The Next.js application

   - Runs on port 3000
   - Hot-reloading enabled
   - Connected to the database

2. **db**: PostgreSQL database
   - Runs on port 5432
   - Persistent volume for data storage
   - Pre-configured with the necessary database

## Security Notes

- The default database credentials are for development only. For production, change them in the `docker-compose.yml` file.
- Never commit the `.env` file to version control.
- Consider using Docker secrets for sensitive information in production.

## Support

If you encounter any issues or have questions about the Docker setup, please:

1. Check the logs using `docker-compose logs`
2. Ensure all prerequisites are met
3. Verify the environment variables are set correctly
4. Try rebuilding the containers with `docker-compose up --build`

## Environment Variable Management

### Overriding Environment Variables

There are several ways to override environment variables in Docker Compose:

1. **Using a .env file (Recommended)**
   Create a `.env` file in the same directory as your `docker-compose.yml`:

   ```env
   DATABASE_URL=postgresql://custom_user:custom_password@db:5432/protrack
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. **Using docker-compose.override.yml**
   Create a `docker-compose.override.yml` file:

   ```yaml
   version: "3.8"
   services:
     app:
       environment:
         - DATABASE_URL=postgresql://custom_user:custom_password@db:5432/protrack
         - NODE_ENV=development
   ```

3. **Using command line arguments**

   ```bash
   docker-compose run -e DATABASE_URL="postgresql://custom_user:custom_password@db:5432/protrack" app
   ```

4. **Using environment file**
   Create a custom environment file (e.g., `custom.env`):
   ```env
   DATABASE_URL=postgresql://custom_user:custom_password@db:5432/protrack
   NODE_ENV=development
   ```
   Then use it with:
   ```bash
   docker-compose --env-file custom.env up
   ```

### Priority of Environment Variables

Environment variables are applied in the following order (last one wins):

1. Values from `docker-compose.yml`
2. Values from `.env` file
3. Values from `docker-compose.override.yml`
4. Values from command line arguments
5. Values from `--env-file` specified files

### Example: Production Environment Setup

1. Create a `production.env` file:

   ```env
   DATABASE_URL=postgresql://prod_user:prod_password@db:5432/protrack
   NODE_ENV=production
   NEXT_PUBLIC_API_URL=https://api.yourdomain.com
   ```

2. Start the application with production environment:
   ```bash
   docker-compose --env-file production.env up
   ```

### Example: Development Environment Setup

1. Create a `development.env` file:

   ```env
   DATABASE_URL=postgresql://dev_user:dev_password@db:5432/protrack
   NODE_ENV=development
   NEXT_PUBLIC_API_URL=http://localhost:3000/api
   ```

2. Start the application with development environment:
   ```bash
   docker-compose --env-file development.env up
   ```

### Security Best Practices

1. Never commit sensitive environment files to version control
2. Use different environment files for different environments (development, staging, production)
3. Consider using Docker secrets for sensitive information in production
4. Use `.gitignore` to exclude environment files:
   ```gitignore
   *.env
   !.env.example
   ```
