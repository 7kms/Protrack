"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  CheckSquare,
  Star,
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Copy,
  Loader2,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
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
import { Calendar } from "@/app/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/app/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/app/components/ui/pagination";
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
} from "date-fns";

interface TaskFormValues {
  title: string;
  description: string;
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
}

const taskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
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
});

interface Task {
  id: number;
  title: string;
  description: string;
  issueLink?: string;
  status: string;
  priority: string;
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
}

interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function TasksPage() {
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
  const [filters, setFilters] = useState({
    assignedToId: "all",
    projectId: "all",
    startDate: "",
    endDate: "",
    status: "all",
    priority: "all",
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
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
      description: "",
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
    },
  });

  const editForm = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      projectId: 0,
      assignedToId: 0,
      dateRange: {
        from: new Date(),
        to: new Date(),
      },
      contributionScore: "0",
    },
  });

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(filters.assignedToId &&
          filters.assignedToId !== "all" && {
            assignedToId: filters.assignedToId,
          }),
        ...(filters.projectId &&
          filters.projectId !== "all" && { projectId: filters.projectId }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.status &&
          filters.status !== "all" && { status: filters.status }),
        ...(filters.priority &&
          filters.priority !== "all" && { priority: filters.priority }),
      });

      const response = await fetch(`/api/tasks?${queryParams}`);
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
      const response = await fetch("/api/users");
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

  useEffect(() => {
    console.log("Current tasks state:", tasks);
  }, [tasks]);

  const onSubmit = async (values: TaskFormValues) => {
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
      form.reset();
      setIsOpen(false);
    } catch (error) {
      console.error("Error creating task:", error);
    } finally {
      setCreateLoading(false);
    }
  };

  // Function to handle edit button click
  const handleEdit = (task: Task) => {
    setSelectedTask(task);
    editForm.reset({
      title: task.title,
      description: task.description || "",
      issueLink: task.issueLink || "",
      priority: task.priority as "high" | "medium" | "low",
      projectId: task.projectId,
      assignedToId: task.assignedToId || 0,
      status: task.status as any,
      dateRange: {
        from: new Date(task.startDate),
        to: new Date(task.endDate),
      },
      contributionScore: task.contributionScore?.toString() || "0",
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
      const response = await fetch(`/api/tasks?id=${taskToDelete}`, {
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

  // Function to handle edit submit
  const onEditSubmit = async (values: TaskFormValues) => {
    if (!selectedTask) return;
    setEditLoading(true);
    try {
      const response = await fetch(`/api/tasks?id=${selectedTask.id}`, {
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
      editForm.reset();
      setIsEditOpen(false);
      setSelectedTask(null);
    } catch (error) {
      console.error("Error updating task:", error);
      alert(error instanceof Error ? error.message : "Failed to update task");
    } finally {
      setEditLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
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

    setDateRange({ from, to });
    setFilters((prev) => ({
      ...prev,
      startDate: from.toISOString(),
      endDate: to.toISOString(),
    }));
  };

  const clearDateFilter = () => {
    setDateRange(undefined);
    setFilters((prev) => ({
      ...prev,
      startDate: "",
      endDate: "",
    }));
  };

  // Add a function to handle copy
  const handleCopy = (task: Task) => {
    form.reset({
      title: task.title,
      description: task.description,
      issueLink: task.issueLink || "",
      priority: task.priority as "high" | "medium" | "low",
      status: task.status as any,
      projectId: task.projectId,
      assignedToId: task.assignedToId,
      dateRange: {
        from: new Date(task.startDate),
        to: new Date(task.endDate),
      },
      contributionScore: task.contributionScore?.toString() || "0",
    });
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <CheckSquare className="h-8 w-8" />
          Tasks
        </h1>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsOpen(false);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <CheckSquare className="h-5 w-5" />
                Create New Task
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter task description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="issueLink"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Link (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter issue link" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_started">
                            Not Started
                          </SelectItem>
                          <SelectItem value="developing">Developing</SelectItem>
                          <SelectItem value="testing">Testing</SelectItem>
                          <SelectItem value="online">Online</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="low">Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((project) => (
                            <SelectItem
                              key={project.id}
                              value={project.id.toString()}
                            >
                              {project.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedToId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assignee</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseInt(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {users.map((user) => (
                            <SelectItem
                              key={user.id}
                              value={user.id.toString()}
                            >
                              {user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateRange"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date Range</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-[300px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value?.from ? (
                                field.value.to ? (
                                  <>
                                    {format(field.value.from, "EEE, MMM dd, y")}{" "}
                                    - {format(field.value.to, "EEE, MMM dd, y")}
                                  </>
                                ) : (
                                  format(field.value.from, "EEE, MMM dd, y")
                                )
                              ) : (
                                <span>Pick a date range</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            initialFocus
                            mode="range"
                            defaultMonth={new Date()}
                            selected={field.value}
                            onSelect={field.onChange}
                            numberOfMonths={2}
                            className="rounded-md border"
                            modifiers={{
                              today: new Date(),
                              weekend: (date) => isWeekend(date),
                            }}
                            modifiersStyles={{
                              today: {
                                border: "2px solid #2563eb",
                                fontWeight: "bold",
                              },
                              weekend: {
                                color: "#dc2626",
                              },
                            }}
                            disabled={(date) => {
                              return (
                                date < new Date(new Date().setHours(0, 0, 0, 0))
                              );
                            }}
                            fromYear={2020}
                            toYear={new Date().getFullYear() + 2}
                            captionLayout="dropdown-years"
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contributionScore"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contribution Score (-10 to 10)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="-10"
                          max="10"
                          step="0.1"
                          placeholder="Enter contribution score"
                          {...field}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || /^-?\d*\.?\d*$/.test(value)) {
                              const num = Number(value);
                              if (value === "" || (num >= -10 && num <= 10)) {
                                field.onChange(value);
                              }
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={createLoading}
                >
                  {createLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                  ) : null}
                  Create Task
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

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

      {/* Edit dialog */}
      <Dialog
        open={isEditOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsEditOpen(false);
            setSelectedTask(null);
            editForm.reset();
          }
        }}
      >
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          <Form {...editForm}>
            <form
              onSubmit={editForm.handleSubmit(onEditSubmit)}
              className="space-y-4"
            >
              <FormField
                control={editForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter task description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="issueLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Link (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter issue link" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="not_started">Not Started</SelectItem>
                        <SelectItem value="developing">Developing</SelectItem>
                        <SelectItem value="testing">Testing</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects.map((project) => (
                          <SelectItem
                            key={project.id}
                            value={project.id.toString()}
                          >
                            {project.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="assignedToId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select assignee" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id.toString()}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="dateRange"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date Range</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-[300px] pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value?.from ? (
                              field.value.to ? (
                                <>
                                  {format(field.value.from, "EEE, MMM dd, y")} -{" "}
                                  {format(field.value.to, "EEE, MMM dd, y")}
                                </>
                              ) : (
                                format(field.value.from, "EEE, MMM dd, y")
                              )
                            ) : (
                              <span>Pick a date range</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          initialFocus
                          mode="range"
                          defaultMonth={new Date()}
                          selected={field.value}
                          onSelect={field.onChange}
                          numberOfMonths={2}
                          className="rounded-md border"
                          modifiers={{
                            today: new Date(),
                            weekend: (date) => isWeekend(date),
                          }}
                          modifiersStyles={{
                            today: {
                              border: "2px solid #2563eb",
                              fontWeight: "bold",
                            },
                            weekend: {
                              color: "#dc2626",
                            },
                          }}
                          disabled={(date) => {
                            return (
                              date < new Date(new Date().setHours(0, 0, 0, 0))
                            );
                          }}
                          fromYear={2020}
                          toYear={new Date().getFullYear() + 2}
                          captionLayout="dropdown-years"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="contributionScore"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contribution Score</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter contribution score (e.g., 1.5)"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === "" || /^\d*\.?\d*$/.test(value)) {
                            field.onChange(value);
                          }
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={editLoading}>
                {editLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2 inline" />
                ) : null}
                Update Task
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Select
          value={filters.assignedToId}
          onValueChange={(value) => handleFilterChange("assignedToId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by assignee" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Assignees</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id.toString()}>
                {user.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.projectId}
          onValueChange={(value) => handleFilterChange("projectId", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id.toString()}>
                {project.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.status}
          onValueChange={(value) => handleFilterChange("status", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="not_started">Not Started</SelectItem>
            <SelectItem value="developing">Developing</SelectItem>
            <SelectItem value="testing">Testing</SelectItem>
            <SelectItem value="online">Online</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filters.priority}
          onValueChange={(value) => handleFilterChange("priority", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => handleQuickFilter("week")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Last Week
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickFilter("month")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Last Month
          </Button>
          <Button
            variant="outline"
            onClick={() => handleQuickFilter("season")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Last Season
          </Button>
          <Button
            variant="outline"
            onClick={clearDateFilter}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Date Filter
          </Button>
        </div>
        <div className="flex gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-[300px] justify-start text-left font-normal",
                  !dateRange?.from && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "EEE, MMM dd, y")} -{" "}
                      {format(dateRange.to, "EEE, MMM dd, y")}
                    </>
                  ) : (
                    format(dateRange.from, "EEE, MMM dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={new Date()}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setFilters((prev) => ({
                    ...prev,
                    startDate: range?.from?.toISOString() || "",
                    endDate: range?.to?.toISOString() || "",
                  }));
                }}
                numberOfMonths={2}
                className="rounded-md border"
                modifiers={{
                  today: new Date(),
                  weekend: (date) => isWeekend(date),
                }}
                modifiersStyles={{
                  today: {
                    border: "2px solid #2563eb",
                    fontWeight: "bold",
                  },
                  weekend: {
                    color: "#dc2626",
                  },
                }}
                disabled={(date) => {
                  return date < new Date(new Date().setHours(0, 0, 0, 0));
                }}
                fromYear={2020}
                toYear={new Date().getFullYear() + 2}
                captionLayout="dropdown-years"
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="rounded-md border relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Project</TableHead>
              <TableHead>Assignee</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Contribution</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task) => (
              <TableRow
                key={task.id}
                className={cn({
                  "bg-yellow-50 dark:bg-yellow-900/30":
                    task.status === "not_started",
                  "bg-blue-50 dark:bg-blue-900/30":
                    task.status === "developing",
                  "bg-purple-50 dark:bg-purple-900/30":
                    task.status === "testing",
                  "bg-green-50 dark:bg-green-900/30": task.status === "online",
                  "bg-orange-50 dark:bg-orange-900/30":
                    task.status === "suspended",
                  "bg-red-50 dark:bg-red-900/30": task.status === "canceled",
                })}
              >
                <TableCell className="font-medium">
                  {task.issueLink ? (
                    <a
                      href={task.issueLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary underline hover:text-primary/80"
                      title="Open GitHub Issue"
                    >
                      {task.title}
                      <ExternalLink className="h-4 w-4 inline-block ml-1" />
                    </a>
                  ) : (
                    task.title
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200":
                          task.status === "not_started",
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200":
                          task.status === "developing",
                        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200":
                          task.status === "testing",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":
                          task.status === "online",
                        "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200":
                          task.status === "suspended",
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200":
                          task.status === "canceled",
                      }
                    )}
                  >
                    {task.status}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200":
                          task.priority === "high",
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200":
                          task.priority === "medium",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":
                          task.priority === "low",
                      }
                    )}
                  >
                    {task.priority}
                  </span>
                </TableCell>
                <TableCell>
                  {projects.find((p) => p.id === task.projectId)?.title}
                </TableCell>
                <TableCell>
                  {users.find((u) => u.id === task.assignedToId)?.name}
                </TableCell>
                <TableCell>
                  {new Date(task.startDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {new Date(task.endDate).toLocaleDateString()}
                </TableCell>
                <TableCell>{task.contributionScore}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(task)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleCopy(task)}
                      title="Copy Task"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

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
