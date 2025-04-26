-- ProTrack Database Schema
-- Version: 2.1

-- Users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'manager', 'developer', 'team_lead')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    difficulty_multiplier DECIMAL(3,2) DEFAULT 1.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    project_id INTEGER NOT NULL REFERENCES projects(id),
    title VARCHAR(100) NOT NULL,
    issue_link VARCHAR(255),
    status VARCHAR(20) NOT NULL CHECK (status IN ('not_started', 'developing', 'testing', 'online', 'suspended', 'canceled')),
    priority VARCHAR(10) NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    category VARCHAR(20) NOT NULL CHECK (category IN ('op', 'h5', 'architecture')) DEFAULT 'op',
    contribution_score INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    assigned_to INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Indexes
CREATE INDEX idx_tasks_project_id ON tasks(project_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to); 
CREATE INDEX idx_tasks_start_date ON tasks(start_date); 
CREATE INDEX idx_tasks_end_date ON tasks(end_date); 