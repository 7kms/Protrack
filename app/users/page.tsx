"use client";

import { useEffect, useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.enum(["admin", "manager", "developer", "team_lead"], {
    required_error: "Please select a role",
  }),
});

interface User {
  id: number;
  name: string;
  role: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const form = useForm<z.infer<typeof userSchema>>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      role: "developer",
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const onSubmit = async (values: z.infer<typeof userSchema>) => {
    try {
      const url = editingUser ? `/api/users/${editingUser.id}` : "/api/users";
      const method = editingUser ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingUser ? "update" : "create"} user`);
      }

      await fetchUsers();
      form.reset();
      setIsOpen(false);
      setEditingUser(null);
    } catch (error) {
      console.error(
        `Error ${editingUser ? "updating" : "creating"} user:`,
        error
      );
    }
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    form.reset({
      name: user.name,
      role: user.role as any,
    });
    setIsOpen(true);
  };

  const handleDelete = (user: User) => {
    setUserToDelete(user);
    setDeleteError(null);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    try {
      const response = await fetch(`/api/users/${userToDelete.id}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }
      await fetchUsers();
      setIsDeleteAlertOpen(false);
      setUserToDelete(null);
      setDeleteError(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete user"
      );
      setIsDeleteAlertOpen(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <Users className="h-8 w-8" />
          Users
        </h1>
        <Dialog
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) {
              setIsOpen(false);
              setEditingUser(null);
              form.reset({ name: "", role: "developer" });
            }
          }}
        >
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setIsOpen(true);
                setEditingUser(null);
                form.reset({ name: "", role: "developer" });
              }}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              New User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5" />
                {editingUser ? "Edit User" : "Create New User"}
              </DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="developer">Developer</SelectItem>
                          <SelectItem value="team_lead">Team Lead</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full">
                  {editingUser ? "Update User" : "Create User"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Users Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow
                key={user.id}
                className="group hover:bg-muted/50 transition-colors"
              >
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                      {
                        "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200":
                          user.role === "admin",
                        "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200":
                          user.role === "manager",
                        "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200":
                          user.role === "developer",
                        "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200":
                          user.role === "team_lead",
                      }
                    )}
                  >
                    {user.role.replace("_", " ")}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(user)}
                      className="hover:bg-primary/10 hover:text-primary"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user)}
                      className="hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete confirmation dialog */}
      <AlertDialog
        open={isDeleteAlertOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsDeleteAlertOpen(false);
            setUserToDelete(null);
            setDeleteError(null);
          }
        }}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
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
                  setUserToDelete(null);
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
                  Delete User
                </AlertDialogAction>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
