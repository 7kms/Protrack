# Product Requirements Document (PRD): ProTrack - Work Statistics System

## Overview

ProTrack is a streamlined work statistics system for managing users, projects, and tasks, with a visual dashboard to track performance and contributions.

---

## 1. User Management

**Features:**

- **Account Management:** Add, edit, remove user accounts.
- **Roles & Permissions:** Assign roles (e.g., Developer, Manager) with customizable access.
- **Search:** Find users by name, role, or project.

---

## 2. Project Management

**Features:**

- **Project Details:** Title, description, logo, and difficulty.
- **Difficulty Multiplier:** Project difficulty multiplies the total task contribution scores.
- **Project Overview:** List tasks with overall project status (e.g., On Track, Completed).

---

## 3. Task Management

**Purpose:**  
Task Management focuses on the **detailed attributes and data** of tasks, ensuring proper tracking and administrative control.

**Features:**

- **Task Details:** Title, description, issue link, developer, status (Not Started, Developing, Testing, Online, Suspended, Canceled), start/end dates.
- **Priority:** High, Medium, Low priority.
- **Contribution Score:** Calculate developer's work contribution within specific timeframes.
- **Task Lifecycle:** Add, update, and remove tasks; assign tasks to developers and set due dates.
- **Task List View:** Display tasks in a **list or table format**, showing all task details, which can be filtered by priority, due date, or status.
- **Administration:** Users can edit all task details, including assigning and reassigning tasks across users.

---

## 4. Contribution Page

**Purpose:**  
The Contribution Page provides comprehensive statistics and visualizations of user contributions across projects and time periods.

**Features:**

- **Project-based Contribution View:**

  - Display construction scores for each user within a specific project
  - Visual comparison of contributions between team members
  - Project difficulty multiplier impact on contribution scores

- **Cross-project Contribution View:**

  - Aggregate contribution scores across all projects
  - Compare user performance across different projects
  - Identify top contributors organization-wide

- **Filtering Options:**

  - Filter by specific project(s)
  - Filter by date range (daily, weekly, monthly, custom)
  - Combine project and date filters for detailed analysis

- **Visualization Features:**

  - Bar charts for comparing contribution scores
  - Line charts for tracking contribution trends over time
  - Pie charts for showing contribution distribution
  - Interactive tooltips with detailed contribution breakdowns
  - Export functionality for reports

- **Performance Metrics:**
  - Total contribution score per user
  - Average contribution per time period
  - Contribution growth rate
  - Project completion impact

---

## 5. Dashboard

**Features:**

- **Visuals:** Pie, bar, and line charts to track tasks and performance metrics.
- **Filters:** Filter by time range, user, project, and task status.
- **Customization:** Save dashboard views and preferences.
- **Export:** Export data to PDF or Excel.

---

## Technical Requirements

- **Platform:** Web-based with responsive design.
- **Database:** Relational database for storing users, projects, tasks, and contribution data.
- **Authentication:** Role-based access control.
- **API Integration:** RESTful APIs for external tool integrations.

---

## User Stories

1. **Admin:** Manage user accounts and permissions.
2. **Manager:** Create and track projects and tasks, analyze team contributions.
3. **Developer:** Update task statuses and track personal contributions.
4. **Team Lead:** View dashboard metrics and contribution data to make data-driven decisions.

---

## Conclusion

ProTrack provides a comprehensive work statistics system that enables efficient task management and detailed contribution tracking. The system offers both high-level performance insights on the **Dashboard** and detailed contribution analysis through the **Contribution Page**, ensuring teams can effectively measure and improve their productivity.

---
