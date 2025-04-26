import {
  pgTable,
  serial,
  text,
  timestamp,
  decimal,
  integer,
  boolean,
  real,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role", {
    enum: ["admin", "manager", "developer", "team_lead"],
  }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  logo: text("logo"),
  difficultyMultiplier: real("difficulty_multiplier").notNull().default(1),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  issueLink: text("issue_link"),
  projectId: integer("project_id")
    .references(() => projects.id)
    .notNull(),
  assignedToId: integer("assigned_to_id").references(() => users.id),
  status: text("status", {
    enum: [
      "not_started",
      "developing",
      "testing",
      "online",
      "suspended",
      "canceled",
    ],
  })
    .notNull()
    .default("not_started"),
  priority: text("priority", { enum: ["high", "medium", "low"] })
    .notNull()
    .default("medium"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  contributionScore: decimal("contribution_score").default("0"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  tasks: many(tasks),
}));

export const projectsRelations = relations(projects, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  assignedTo: one(users, {
    fields: [tasks.assignedToId],
    references: [users.id],
  }),
}));
