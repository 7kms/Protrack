# ProTrack - Work Statistics System

ProTrack is a modern, full-stack work statistics system built with Next.js 15, designed to help teams manage projects, track tasks, and analyze contributions efficiently.

## Features

### User Management

- Simple user management with role-based access control
- Support for different roles: Admin, Manager, Developer, Team Lead
- Streamlined user interface for account management

### Project Management

- Create and manage projects with difficulty multipliers
- Track project status and progress
- Project overview with key metrics

### Task Management

- Create and assign tasks with priority levels (high, medium, low)
- Track task status (not_started, developing, testing, online, suspended, canceled)
- Categorize tasks (op, h5, web, architecture)
- Set start and end dates for better timeline management
- Link tasks to external issue tracking systems
- Track contribution scores

### Contribution Analysis

- Comprehensive contribution tracking across projects
- Visual statistics and performance metrics
- Project-based and cross-project contribution views
- Advanced filtering by project and date range
- Interactive charts and data visualization
- Export functionality for detailed reports

### Visual Dashboard

- Real-time project and task statistics
- Performance metrics visualization
- Customizable dashboard views

## Tech Stack

### Frontend

- **Next.js 15** - React framework for server-side rendering and API routes
- **shadcn/ui** - Beautiful, accessible UI components
- **Tailwind CSS** - Utility-first CSS framework
- **Zustand** - Lightweight state management
- **Recharts** - Interactive data visualization
- **React Query** - Server state management
- **React Hook Form** - Form handling with validation

### Backend

- **Next.js API Routes** - Server-side API endpoints
- **PostgreSQL** - Robust relational database
- **Drizzle ORM** - Type-safe database operations
- **Zod** - Schema validation

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- PostgreSQL 16 or later
- pnpm package manager

### Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/protrack.git
cd protrack
```

2. Install dependencies:

```bash
pnpm install
```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/protrack"
```

4. Initialize the database:

```bash
pnpm db:push
```

5. Start the development server:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Docker Deployment

ProTrack can also be deployed using Docker and Docker Compose for a containerized environment.

### Prerequisites for Docker

- Docker installed on your system
- Docker Compose installed on your system

### Docker Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/protrack.git
cd protrack
```

2. Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://postgres:postgres@db:5432/protrack"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
```

3. Start the application:

```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Updating the Application

After pulling updates from git, you need to rebuild the Docker image to incorporate the changes:

```bash
# Pull the latest changes
git pull origin main

# Rebuild and restart the containers
docker-compose up --build

# Or if you prefer to rebuild in detached mode
docker-compose up --build -d
```

**Important**: Do NOT use `docker-compose restart` after pulling updates, as it will not rebuild the image with your new code changes.

### Alternative Update Commands

```bash
# Force rebuild without cache (if experiencing issues)
docker-compose build --no-cache
docker-compose up

# Stop, rebuild, and start
docker-compose down
docker-compose up --build
```

For more detailed Docker setup instructions, see [DOCKER.md](DOCKER.md).

## Database Backup and Import

For comprehensive information on PostgreSQL database backup and import procedures, see [POSTGRES_BACKUP.md](POSTGRES_BACKUP.md).

This includes:

- Docker and native PostgreSQL backup methods
- Automated backup scripts
- Data restoration procedures
- Best practices and troubleshooting

## Database Schema

The system uses a PostgreSQL database with the following main tables:

### Users

- Basic user information and role management
- Roles: admin, manager, developer, team_lead

### Projects

- Project details and status tracking
- Difficulty multiplier for contribution calculations

### Tasks

- Task management with priority and status
- Assignment tracking
- Start and end date management
- Issue link integration
- Contribution score tracking
- Task categories (op, h5, web, architecture)

## Development Tools

- **Drizzle Studio**: Run `pnpm db:studio` to view and manage database
- **Drizzle Kit**: Database migration and schema management
- **ESLint**: Code linting
- **TypeScript**: Type safety
- **Tailwind CSS**: Styling

## API Endpoints

### Dashboard

- `GET /api/dashboard/stats` - Get consolidated dashboard statistics

### Users

- `GET /api/users` - List all users
- `GET /api/users/stats` - Get user statistics (team member count)
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user details
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects

- `GET /api/projects` - List all projects
- `GET /api/projects/stats` - Get project statistics (total project count)
- `POST /api/projects` - Create new project
- `GET /api/projects/:id` - Get project details
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks

- `GET /api/tasks` - List all tasks (with pagination)
- `GET /api/tasks/stats` - Get task statistics (active, completed, total counts)
- `POST /api/tasks` - Create new task
- `GET /api/tasks/:id` - Get task details
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Contributions

- `GET /api/contributions` - Get contribution statistics
- `GET /api/contributions/project/:id` - Get project-specific contributions
- `GET /api/contributions/user/:id` - Get user-specific contributions
- `GET /api/contributions/export` - Export contribution data

## State Management

The application uses Zustand for state management with the following stores:

- `useUserStore` - User authentication and profile
- `useProjectStore` - Project management
- `useTaskStore` - Task management
- `useContributionStore` - Contribution tracking and analysis
- `useDashboardStore` - Dashboard data and filters

## UI Components

The application uses shadcn/ui components for a consistent and accessible interface:

- Navigation and Layout
- Forms and Inputs
- Data Tables
- Charts and Statistics
- Modals and Dialogs
- Loading States

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Next.js team for the amazing framework
- shadcn/ui for the beautiful components
- PostgreSQL community for the robust database
- All contributors and users of the project
