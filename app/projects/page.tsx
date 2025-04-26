"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  Plus,
  Edit,
  Trash2,
  FolderKanban,
  Star,
  AlertCircle,
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
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/app/components/ui/form";
import { Input } from "@/app/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { cn } from "@/lib/utils";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  difficultyMultiplier: z.number().min(0.1).max(5),
});

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  difficultyMultiplier: number;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      difficultyMultiplier: 1,
    },
  });

  useEffect(() => {
    fetchProjects();
  }, []);

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

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    form.reset({
      title: project.title,
      description: project.description || "",
      difficultyMultiplier: project.difficultyMultiplier,
    });
    setIsOpen(true);
  };

  const handleDelete = async (projectId: number) => {
    setProjectToDelete(projectId);
    setDeleteError(null);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!projectToDelete) return;

    try {
      const response = await fetch(`/api/projects?id=${projectToDelete}`, {
        method: "DELETE",
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete project");
      }

      await fetchProjects();
      setIsDeleteAlertOpen(false);
      setProjectToDelete(null);
      setDeleteError(null);
    } catch (error) {
      console.error("Error deleting project:", error);
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete project"
      );
      setIsDeleteAlertOpen(true);
    }
  };

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      const url = editingProject
        ? `/api/projects?id=${editingProject.id}`
        : "/api/projects";
      const method = editingProject ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          status: editingProject?.status || "not_started",
        }),
      });

      if (!response.ok) {
        throw new Error(
          `Failed to ${editingProject ? "update" : "create"} project`
        );
      }

      await fetchProjects();
      form.reset();
      setIsOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error("Error creating/updating project:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <FolderKanban className="h-8 w-8" />
          Projects
        </h1>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsOpen(false);
              setEditingProject(null);
              form.reset();
            }
          }}
        >
          <DialogTrigger asChild>
            <Button onClick={() => setIsOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FolderKanban className="h-5 w-5" />
                {editingProject ? "Edit Project" : "Create New Project"}
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
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter project title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter project description"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficultyMultiplier"
                  render={({ field }: { field: any }) => (
                    <FormItem>
                      <FormLabel>Difficulty Multiplier</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.1"
                          min="0.1"
                          max="5"
                          placeholder="Enter difficulty multiplier"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingProject ? "Update Project" : "Create Project"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteAlertOpen(false);
            setProjectToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Project</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this project? This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/15 p-4 text-sm text-destructive">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="font-medium">{deleteError}</p>
            </div>
          )}
          <AlertDialogFooter className="gap-2 sm:gap-0">
            {deleteError ? (
              <AlertDialogAction
                onClick={() => {
                  setIsDeleteAlertOpen(false);
                  setProjectToDelete(null);
                  setDeleteError(null);
                }}
                autoFocus
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Close
              </AlertDialogAction>
            ) : (
              <>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={confirmDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Project
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Card
            key={project.id}
            className="transition-all duration-300 hover:shadow-lg group"
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                {project.title}
                {project.difficultyMultiplier >= 4 && (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                )}
              </CardTitle>
              <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleEdit(project)}
                  className="hover:bg-primary/10 hover:text-primary"
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(project.id)}
                  className="hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200":
                          project.status === "not_started",
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200":
                          project.status === "in_progress",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":
                          project.status === "completed",
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200":
                          project.status === "suspended",
                      }
                    )}
                  >
                    {project.status}
                  </span>
                </div>
                <span className="flex items-center gap-1 text-sm font-medium text-muted-foreground">
                  <Star className="h-3 w-3" />
                  {project.difficultyMultiplier}x
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
