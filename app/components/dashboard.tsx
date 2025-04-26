"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useRouter } from "next/navigation";
import { Activity, Users, CheckCircle, Folder } from "lucide-react";

interface DashboardStats {
  totalProjects: number;
  activeTasks: number;
  completedTasks: number;
  teamMembers: number;
}

interface RecentItem {
  id: number;
  title: string;
  status: string;
  date: string;
}

export function Dashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeTasks: 0,
    completedTasks: 0,
    teamMembers: 0,
  });
  const [recentProjects, setRecentProjects] = useState<RecentItem[]>([]);
  const [recentTasks, setRecentTasks] = useState<RecentItem[]>([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projectsResponse = await fetch("/api/projects");
      const projects = await projectsResponse.json();

      // Fetch tasks
      const tasksResponse = await fetch("/api/tasks");
      const tasksData = await tasksResponse.json();
      const tasks = tasksData.tasks || [];

      // Fetch users
      const usersResponse = await fetch("/api/users");
      const users = await usersResponse.json();

      // Calculate stats
      const activeTasks = tasks.filter(
        (t: any) => t.status === "developing" || t.status === "testing"
      ).length;
      const completedTasks = tasks.filter(
        (t: any) => t.status === "online"
      ).length;

      setStats({
        totalProjects: Array.isArray(projects) ? projects.length : 0,
        activeTasks,
        completedTasks,
        teamMembers: Array.isArray(users) ? users.length : 0,
      });

      // Set recent items
      if (Array.isArray(projects)) {
        setRecentProjects(
          projects.slice(0, 5).map((p: any) => ({
            id: p.id,
            title: p.title,
            status: p.status,
            date: new Date(p.createdAt).toLocaleDateString(),
          }))
        );
      }

      if (Array.isArray(tasks)) {
        setRecentTasks(
          tasks.slice(0, 5).map((t: any) => ({
            id: t.id,
            title: t.title,
            status: t.status,
            date: new Date(t.createdAt).toLocaleDateString(),
          }))
        );
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      // Set default values in case of error
      setStats({
        totalProjects: 0,
        activeTasks: 0,
        completedTasks: 0,
        teamMembers: 0,
      });
      setRecentProjects([]);
      setRecentTasks([]);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          Dashboard
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="cursor-pointer transition-all duration-300 hover:bg-accent/5 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-primary"
          onClick={() => router.push("/projects")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-all duration-300 hover:bg-accent/5 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-orange-500"
          onClick={() => router.push("/tasks")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Activity className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTasks}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-all duration-300 hover:bg-accent/5 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-green-500"
          onClick={() => router.push("/tasks")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Completed Tasks
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedTasks}</div>
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-all duration-300 hover:bg-accent/5 hover:shadow-lg hover:scale-[1.02] border-l-4 border-l-blue-500"
          onClick={() => router.push("/users")}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card
          className="cursor-pointer transition-all duration-300 hover:bg-accent/5 hover:shadow-lg border-t-4 border-t-primary"
          onClick={() => router.push("/projects")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Folder className="h-5 w-5" />
              Recent Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentProjects.length > 0 ? (
              <div className="space-y-4">
                {recentProjects.map((project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{project.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {project.status}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted">
                      {project.date}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No projects yet</p>
            )}
          </CardContent>
        </Card>
        <Card
          className="cursor-pointer transition-all duration-300 hover:bg-accent/5 hover:shadow-lg border-t-4 border-t-orange-500"
          onClick={() => router.push("/tasks")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Recent Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium">{task.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {task.status}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground px-2 py-1 rounded-md bg-muted">
                      {task.date}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No tasks yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
