"use client";

import { useEffect, useState, Suspense } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Loader2,
  Check,
  Download,
} from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { DateRange } from "react-day-picker";
import { cn } from "../lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/app/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import {
  addDays,
  subDays,
  subMonths,
  subWeeks,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWeekend,
  addYears,
  subYears,
  startOfYear,
  endOfYear,
  differenceInCalendarDays,
  format,
} from "date-fns";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { MultiSelect } from "@/app/components/ui/multi-select";
import { TaskFormDialog } from "./components/task-form";
import { TaskFilters } from "./components/task-filters";

interface TaskFormValues {
  title: string;
  issueLink?: string;
  priority: "high" | "medium" | "low";
  projectId: number;
  assignedToId: number;
  status:
    | "not_started"
    | "developing"
    | "testing"
    | "online"
    | "suspended"
    | "canceled";
  dateRange: {
    from: Date;
    to: Date;
  };
  contributionScore: string;
  category: "op" | "h5" | "web" | "architecture";
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  issueLink: z.string().optional(),
  priority: z.enum(["high", "medium", "low"], {
    required_error: "Please select a priority",
  }),
  projectId: z.number().min(1, "Project is required"),
  assignedToId: z.number().min(1, "Assignee is required"),
  status: z.enum(
    ["not_started", "developing", "testing", "online", "suspended", "canceled"],
    {
      required_error: "Please select a status",
    }
  ),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  contributionScore: z
    .string()
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num >= -10 && num <= 10;
    }, "Contribution score must be between -10 and 10")
    .transform((val) => Number(val)),
  category: z.enum(["op", "h5", "web", "architecture"], {
    required_error: "Please select a category",
  }),
});

interface Task {
  id: number;
  title: string;
  issueLink?: string;
  status: string;
  priority: string;
  category: "op" | "h5" | "web" | "architecture";
  projectId: number;
  assignedToId: number;
  startDate: string;
  endDate: string;
  contributionScore: string;
}

interface Project {
  id: number;
  title: string;
}

interface User {
  id: number;
  name: string;
  active: boolean;
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface FilterState {
  assignedToId: string[];
  projectId: string[];
  status: string[];
  priority: string[];
  category: string[];
  startDate: string;
  endDate: string;
}

// Add this new component at the top of the file, before the TasksPage component
const TasksTable = React.memo(
  ({
    tasks,
    projects,
    users,
    loading,
    onEdit,
    onCopy,
    onDelete,
  }: {
    tasks: Task[];
    projects: Project[];
    users: User[];
    loading: boolean;
    onEdit: (task: Task) => void;
    onCopy: (task: Task) => void;
    onDelete: (taskId: number) => void;
  }) => {
    return (
      <div className="rounded-lg border bg-card relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title (Issue)</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days Lasted</TableHead>
              <TableHead>Contribution</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => {
              const start = new Date(task.startDate);
              const end = new Date(task.endDate);
              const daysLasted = differenceInCalendarDays(end, start) + 1;
              return (
                <TableRow
                  key={task.id}
                  className={cn(
                    "group transition-colors",
                    task.status === "online" &&
                      "bg-green-50 dark:bg-green-900/30"
                  )}
                >
                  <TableCell className="font-medium">
                    {task.issueLink ? (
                      <a
                        href={task.issueLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                      >
                        {task.title}
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    ) : (
                      task.title
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        task.status === "not_started" &&
                          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
                        task.status === "developing" &&
                          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        task.status === "testing" &&
                          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                        task.status === "online" &&
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        task.status === "suspended" &&
                          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
                        task.status === "canceled" &&
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                      )}
                    >
                      {task.status.replace(/_/g, " ")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        task.priority === "high" &&
                          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
                        task.priority === "medium" &&
                          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        task.priority === "low" &&
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                      )}
                    >
                      {task.priority}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        task.category === "op" &&
                          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
                        task.category === "h5" &&
                          "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
                        task.category === "web" &&
                          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
                        task.category === "architecture" &&
                          "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200"
                      )}
                    >
                      {task.category.toUpperCase()}
                    </span>
                  </TableCell>
                  <TableCell>
                    {projects.find((p) => p.id === task.projectId)?.title}
                  </TableCell>
                  <TableCell>
                    {users.find((u) => u.id === task.assignedToId)?.name}
                    {users.find((u) => u.id === task.assignedToId)?.active ===
                      false && (
                      <span className="ml-2 text-xs text-muted-foreground">
                        (Inactive)
                      </span>
                    )}
                  </TableCell>
                  <TableCell>{format(start, "MM/dd")}</TableCell>
                  <TableCell>{format(end, "MM/dd")}</TableCell>
                  <TableCell>{daysLasted}</TableCell>
                  <TableCell>{task.contributionScore}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(task)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onCopy(task)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This action cannot be undone. This will
                              permanently delete the task.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => onDelete(task.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    );
  }
);

TasksTable.displayName = "TasksTable";

function TasksPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [filters, setFilters] = useState<FilterState>(() => {
    const getArrayFromParams = (param: string | null) =>
      param ? param.split(",") : [];

    return {
      assignedToId: getArrayFromParams(searchParams.get("assignedToId")),
      projectId: getArrayFromParams(searchParams.get("projectId")),
      status: getArrayFromParams(searchParams.get("status")),
      priority: getArrayFromParams(searchParams.get("priority")),
      category: getArrayFromParams(searchParams.get("category")),
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
    };
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const from = searchParams.get("startDate");
    const to = searchParams.get("endDate");
    if (from && to) {
      return {
        from: new Date(from),
        to: new Date(to),
      };
    }
    return undefined;
  });
  const [loading, setLoading] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null);

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      issueLink: "",
      priority: "medium",
      status: "not_started",
      projectId: 0,
      assignedToId: 0,
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      contributionScore: "0",
      category: "h5",
    },
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      // Add filters only if they have values
      if (filters.assignedToId.length > 0) {
        queryParams.set("assignedToId", filters.assignedToId.join(","));
      }
      if (filters.projectId.length > 0) {
        queryParams.set("projectId", filters.projectId.join(","));
      }
      if (filters.status.length > 0) {
        queryParams.set("status", filters.status.join(","));
      }
      if (filters.priority.length > 0) {
        queryParams.set("priority", filters.priority.join(","));
      }
      if (filters.category.length > 0) {
        queryParams.set("category", filters.category.join(","));
      }
      if (filters.startDate) {
        queryParams.set("startDate", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.set("endDate", filters.endDate);
      }

      const response = await fetch(`/api/tasks?${queryParams.toString()}`);
      const data = await response.json();
      setTasks(data.tasks || []);
      setPagination(
        data.pagination || {
          total: 0,
          page: 1,
          limit: 20,
          totalPages: 1,
        }
      );
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      setTasks([]);
      setPagination({
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      setProjects([]);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users?includeInactive=true");
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch users:", error);
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchTasks();
    fetchProjects();
    fetchUsers();
  }, [pagination.page, pagination.limit, filters]);

  const handleCreateSubmit = async (values: TaskFormValues) => {
    setCreateLoading(true);
    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          startDate: values.dateRange.from.toISOString(),
          endDate: values.dateRange.to.toISOString(),
          contributionScore: Number(values.contributionScore),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create task");
      }

      await fetchTasks();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditSubmit = async (values: TaskFormValues) => {
    if (!selectedTask) return;
    setEditLoading(true);
    try {
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          startDate: values.dateRange.from.toISOString(),
          endDate: values.dateRange.to.toISOString(),
          contributionScore: Number(values.contributionScore),
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update task");
      }

      await fetchTasks();
      setSelectedTask(null);
      setIsEditOpen(false);
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setEditLoading(false);
    }
  };

  // Function to handle edit button click
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    form.reset({
      title: task.title,
      issueLink: task.issueLink || "",
      priority: task.priority as "high" | "medium" | "low",
      status: task.status as any,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      dateRange: {
        from: new Date(task.startDate),
        to: new Date(task.endDate),
      },
      contributionScore: task.contributionScore.toString(),
      category: task.category as "op" | "h5" | "web" | "architecture",
    });
    setIsEditOpen(true);
  };

  // Function to handle delete
  const handleDelete = async (taskId: number) => {
    setTaskToDelete(taskId);
    setDeletingTaskId(taskId);
    setDeleteLoading(false);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setDeleteLoading(true);
    try {
      const response = await fetch(`/api/tasks/${taskToDelete}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      await fetchTasks();
    } catch (error) {
      console.error("Error deleting task:", error);
    } finally {
      setIsDeleteAlertOpen(false);
      setTaskToDelete(null);
      setDeleteLoading(false);
      setDeletingTaskId(null);
    }
  };

  const updateUrlParams = (newFilters: FilterState) => {
    const params = new URLSearchParams();

    if (newFilters.assignedToId.length > 0) {
      params.set("assignedToId", newFilters.assignedToId.join(","));
    }
    if (newFilters.projectId.length > 0) {
      params.set("projectId", newFilters.projectId.join(","));
    }
    if (newFilters.status.length > 0) {
      params.set("status", newFilters.status.join(","));
    }
    if (newFilters.priority.length > 0) {
      params.set("priority", newFilters.priority.join(","));
    }
    if (newFilters.category.length > 0) {
      params.set("category", newFilters.category.join(","));
    }
    if (newFilters.startDate) {
      params.set("startDate", newFilters.startDate);
    }
    if (newFilters.endDate) {
      params.set("endDate", newFilters.endDate);
    }

    const newUrl = params.toString()
      ? `?${params.toString()}`
      : window.location.pathname;
    router.push(newUrl, { scroll: false });
  };

  const handleFilterChange = (key: keyof FilterState, value: string[]) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    updateUrlParams(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleDateRangeChange = (range: DateRange | undefined) => {
    setDateRange(range);
    const newFilters = {
      ...filters,
      startDate: range?.from?.toISOString() || "",
      endDate: range?.to?.toISOString() || "",
    };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const handleQuickFilter = (range: "week" | "month" | "season") => {
    const today = new Date();
    let from: Date;
    let to: Date = today;

    switch (range) {
      case "week":
        from = subWeeks(today, 1);
        break;
      case "month":
        from = subMonths(today, 1);
        break;
      case "season":
        from = subMonths(today, 3);
        break;
      default:
        from = today;
    }

    const newRange = { from, to };
    setDateRange(newRange);
    const newFilters = {
      ...filters,
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  const clearDateFilter = () => {
    setDateRange(undefined);
    const newFilters = {
      ...filters,
      startDate: "",
      endDate: "",
    };
    setFilters(newFilters);
    updateUrlParams(newFilters);
  };

  // Function to handle copy
  const handleCopy = (task: Task) => {
    form.reset({
      title: task.title,
      issueLink: task.issueLink || "",
      priority: task.priority as "high" | "medium" | "low",
      status: task.status as any,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      dateRange: {
        from: new Date(task.startDate),
        to: new Date(task.endDate),
      },
      contributionScore: task.contributionScore.toString(),
      category: task.category as "op" | "h5" | "web" | "architecture",
    });
    setIsOpen(true);
  };

  const handleExport = async () => {
    try {
      // Get current filter parameters
      const queryParams = new URLSearchParams();

      if (filters.assignedToId.length > 0) {
        queryParams.set("assignedToId", filters.assignedToId.join(","));
      }
      if (filters.projectId.length > 0) {
        queryParams.set("projectId", filters.projectId.join(","));
      }
      if (filters.status.length > 0) {
        queryParams.set("status", filters.status.join(","));
      }
      if (filters.priority.length > 0) {
        queryParams.set("priority", filters.priority.join(","));
      }
      if (filters.category.length > 0) {
        queryParams.set("category", filters.category.join(","));
      }
      if (filters.startDate) {
        queryParams.set("startDate", filters.startDate);
      }
      if (filters.endDate) {
        queryParams.set("endDate", filters.endDate);
      }

      // Trigger download using the new export route
      window.location.href = `/api/tasks/export?${queryParams.toString()}`;
    } catch (error) {
      console.error("Error exporting tasks:", error);
      alert("Failed to export tasks. Please try again.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Tasks
        </h1>
        <div className="flex items-center gap-2">
          <Button onClick={handleExport} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
          <Button onClick={() => setIsOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      {/* Create Task Form */}
      <TaskFormDialog
        mode="create"
        open={isOpen}
        onOpenChange={setIsOpen}
        onSubmit={handleCreateSubmit}
        defaultValues={form.getValues()}
        projects={projects}
        users={users}
        loading={createLoading}
        form={form}
      />

      {/* Edit Task Form */}
      <TaskFormDialog
        mode="edit"
        open={isEditOpen}
        onOpenChange={(open) => {
          setIsEditOpen(open);
          if (!open) {
            setSelectedTask(null);
          }
        }}
        onSubmit={handleEditSubmit}
        defaultValues={form.getValues()}
        projects={projects}
        users={users}
        loading={editLoading}
        form={form}
      />

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => {
          if (!open) setIsDeleteAlertOpen(false);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              task and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTaskToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
              ) : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Filters */}
      <div className="p-4 bg-muted/50 rounded-lg">
        <TaskFilters
          assignedToId={filters.assignedToId}
          projectId={filters.projectId}
          status={filters.status}
          priority={filters.priority}
          category={filters.category}
          dateRange={dateRange}
          users={users}
          projects={projects}
          onFilterChange={handleFilterChange}
          onDateRangeChange={handleDateRangeChange}
          onQuickFilter={handleQuickFilter}
          onClearDateFilter={clearDateFilter}
        />
      </div>

      {/* Tasks Table */}
      <TasksTable
        tasks={tasks}
        projects={projects}
        users={users}
        loading={loading}
        onEdit={handleEdit}
        onCopy={handleCopy}
        onDelete={handleDelete}
      />

      {/* Pagination */}
      <div className="flex items-center justify-between px-2">
        <div className="flex-1 text-sm text-muted-foreground">
          Showing {tasks.length} of {pagination.total} items
        </div>
        <div className="flex items-center space-x-6 lg:space-x-8">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows per page</p>
            <Select
              value={pagination.limit.toString()}
              onValueChange={(value) => {
                setPagination((prev) => ({
                  ...prev,
                  limit: parseInt(value),
                  page: 1,
                }));
              }}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={pagination.limit} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((pageSize) => (
                  <SelectItem key={pageSize} value={pageSize.toString()}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TasksPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TasksPageContent />
    </Suspense>
  );
}
