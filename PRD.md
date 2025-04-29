# Product Requirements Document (PRD): ProTrack - Work Statistics System

## Overview

ProTrack is a streamlined work statistics system for managing users, projects, and tasks, with a visual dashboard to track performance and contributions. Built with Next.js 15, it provides a modern, type-safe, and efficient solution for team productivity tracking.

---

## 1. User Management

**Features:**

- **Account Management:** Add, edit, remove user accounts
- **Roles & Permissions:**
  - Admin: Full system access
  - Manager: Project and task management
  - Developer: Task updates and personal tracking
  - Team Lead: Team performance monitoring
- **Search:** Find users by name, role, or project

---

## 2. Project Management

**Features:**

- **Project Details:**
  - Title and description
  - Difficulty multiplier (decimal 3,2)
  - Creation timestamp
- **Project Overview:**
  - List of associated tasks
  - Overall project status
  - Contribution metrics

---

## 3. Task Management

**Purpose:**  
Task Management focuses on the detailed attributes and data of tasks, ensuring proper tracking and administrative control.

**Features:**

- **Task Details:**

  - Title and description
  - Project association
  - Issue link integration
  - Status tracking (not_started, developing, testing, online, suspended, canceled)
  - Priority levels (high, medium, low)
  - Category classification (op, h5, web, architecture)
  - Contribution score calculation
  - Start and end dates
  - Developer assignment

- **Task List View:**

  - Filterable by:
    - Project
    - Status
    - Priority
    - Category
    - Date range
    - Assigned developer
  - Sortable columns
  - Pagination support

- **Task Administration:**
  - Create, update, and delete tasks
  - Assign/reassign developers
  - Update status and priority
  - Track contribution scores
  - Manage issue links

---

## 4. Contribution Analysis

**Purpose:**  
The Contribution Analysis provides comprehensive statistics and visualizations of user contributions across projects and time periods.

**Features:**

- **Project-based Analysis:**

  - Individual contribution scores
  - Team comparison metrics
  - Difficulty multiplier impact
  - Project completion rates

- **Cross-project Analysis:**

  - Aggregate contribution scores
  - Performance comparison
  - Top contributor identification
  - Trend analysis

- **Filtering Options:**

  - Project selection
  - Date range (daily, weekly, monthly, custom)
  - User/team selection
  - Category filtering

- **Visualization Features:**

  - Interactive charts using Recharts
  - Bar charts for comparison
  - Line charts for trends
  - Pie charts for distribution
  - Export to Excel functionality

- **Performance Metrics:**
  - Total contribution scores
  - Average contributions
  - Growth rates
  - Project impact analysis

---

## 5. Dashboard

**Features:**

- **Visual Components:**

  - Project status overview
  - Task distribution charts
  - Contribution trends
  - Team performance metrics

- **Filtering Options:**

  - Time range selection
  - Project filtering
  - User/team selection
  - Status filtering

- **Customization:**

  - Saveable views
  - Layout preferences
  - Metric selection

- **Export Capabilities:**
  - Excel export
  - PDF reports
  - Custom date ranges

---

## Technical Requirements

- **Platform:**

  - Next.js 15 with App Router
  - TypeScript strict mode
  - Server Components by default
  - Client Components marked with 'use client'

- **Database:**

  - PostgreSQL 16+
  - Drizzle ORM for type-safe operations
  - Connection pooling
  - SSL support

- **State Management:**

  - Zustand for global state
  - React Query for server state
  - Proper suspense boundaries

- **UI/UX:**

  - shadcn/ui components
  - Tailwind CSS styling
  - Responsive design
  - Dark mode support

- **API:**
  - Next.js Route Handlers
  - Zod validation
  - RESTful conventions
  - Type-safe responses

---

## User Stories

1. **Admin:**

   - Manage user accounts and permissions
   - Monitor system-wide metrics
   - Configure system settings

2. **Manager:**

   - Create and manage projects
   - Assign tasks to developers
   - Track project progress
   - Analyze team performance

3. **Developer:**

   - Update task status
   - Track personal contributions
   - View assigned tasks
   - Monitor project progress

4. **Team Lead:**
   - View team performance
   - Analyze contribution metrics
   - Make data-driven decisions
   - Export reports

---

## Conclusion

ProTrack provides a comprehensive work statistics system that enables efficient task management and detailed contribution tracking. The system offers both high-level performance insights on the Dashboard and detailed contribution analysis through the Contribution Analysis page, ensuring teams can effectively measure and improve their productivity.

The system is built with modern technologies and follows best practices for type safety, performance, and user experience. It provides a robust foundation for tracking and analyzing team productivity while maintaining flexibility for future enhancements.

---
