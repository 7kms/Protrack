# Product Requirements Document (PRD): ProTrack - Work Statistics System

## Overview

ProTrack is a streamlined work statistics system for managing users, projects, and tasks, with a visual dashboard and Kanban board to track performance and contributions.

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
- **Contribution Score:** Calculate developer’s work contribution within specific timeframes.
- **Task Lifecycle:** Add, update, and remove tasks; assign tasks to developers and set due dates.
- **Task List View:** Display tasks in a **list or table format**, showing all task details, which can be filtered by priority, due date, or status.
- **Administration:** Users can edit all task details, including assigning and reassigning tasks across users.

**How it works with Kanban:**

- **Task Management** holds the core task data, including detailed attributes like title, assignee, priority, and dates.
- Any updates or edits to task data (e.g., priority change, due date update) are handled here and reflected across the system, including the Kanban board.

---

## 4. Kanban Board

**Purpose:**  
The Kanban board provides a **visual, interactive interface** to manage and track tasks through different stages of the workflow, without replacing task-level management.

**Features:**

- **Columns:** Tasks are grouped into customizable columns based on their status (e.g., "To Do", "In Progress", "Completed").
- **Drag-and-Drop:** Tasks can be moved between columns to update their status (e.g., from "To Do" to "In Progress").
- **Task Preview:** Hovering over a task card displays key information (title, assignees, priority, due date, etc.).
- **Real-Time Updates:** Changes made on the Kanban board are reflected in the Task Management system and vice versa, ensuring consistency in task status and data.
- **Filters:** Users can filter tasks by priority, due date, or assignee within the Kanban view.
- **Task Interactivity:** Users can click into any task to view or edit detailed task information (e.g., update description, assignee, due dates).

**How it works with Task Management:**

- The **Kanban board** does not manage task data but **visualizes** it in a workflow-oriented interface.
- Tasks created or edited in **Task Management** are automatically updated on the **Kanban board**, and changes made on the board (e.g., moving a task to "In Progress") will update the **status** of the task in the Task Management system.
- **Task Management** remains the primary source for detailed task attributes, while the **Kanban board** allows teams to **track progress visually**.

---

## 5. Dashboard

**Features:**

- **Visuals:** Pie, bar, and line charts to track tasks and performance metrics.
- **Filters:** Filter by time range, user, project, and task status.
- **Customization:** Save dashboard views and preferences.
- **Export:** Export data to PDF or Excel.
- **Kanban Integration:** Display task data such as task distribution across different Kanban columns (e.g., how many tasks are in "In Progress" vs. "Completed").
- **Task Progress:** The dashboard will aggregate data from both **Task Management** and **Kanban** for a comprehensive view of overall task completion rates, project progress, and individual contributions.

---

## Technical Requirements

- **Platform:** Web-based with responsive design.
- **Database:** Relational database for storing users, projects, tasks, and Kanban data.
- **Authentication:** Role-based access control.
- **API Integration:** RESTful APIs for external tool integrations.

---

## User Stories

1. **Admin:** Manage user accounts and permissions.
2. **Manager:** Create and track projects and tasks, visualize workflows on the Kanban board.
3. **Developer:** Update task statuses on the Kanban board and track contributions via Task Management.
4. **Team Lead:** View dashboard metrics and Kanban data to make data-driven decisions.

---

## Conclusion

ProTrack integrates both **Task Management** and a **Kanban board**, ensuring efficient task handling at both the **granular level** and **workflow visualization**. The system will provide a seamless, real-time experience for users, with both high-level performance insights on the **Dashboard** and detailed task management features.

---
