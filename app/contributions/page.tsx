"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { DateRangePicker } from "@/app/components/ui/date-range-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
import { DateRange } from "react-day-picker";

interface ContributionData {
  users: {
    [userId: number]: {
      id: number;
      name: string;
      role: string;
      totalContribution: number;
      projects: {
        [projectId: number]: {
          id: number;
          title: string;
          difficulty: number;
          totalContribution: number;
          tasks: Array<{
            id: number;
            title: string;
            contribution: number;
            startDate: Date | null;
            endDate: Date | null;
          }>;
        };
      };
      projectContributions: Array<{
        name: string;
        value: number;
      }>;
    };
  };
  totalContributions: number;
}

interface Project {
  id: number;
  title: string;
}

interface User {
  id: number;
  name: string;
}

export default function ContributionsPage() {
  const [contributionData, setContributionData] =
    useState<ContributionData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [loading, setLoading] = useState(false);

  const setDateRangePreset = (preset: string) => {
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    const lastSeason = new Date(today);
    lastSeason.setMonth(today.getMonth() - 3);
    const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const thisSeason = new Date(
      today.getFullYear(),
      Math.floor(today.getMonth() / 3) * 3,
      1
    );
    const thisYear = new Date(today.getFullYear(), 0, 1);

    switch (preset) {
      case "lastWeek":
        setDateRange({ from: lastWeek, to: today });
        break;
      case "lastMonth":
        setDateRange({ from: lastMonth, to: today });
        break;
      case "lastSeason":
        setDateRange({ from: lastSeason, to: today });
        break;
      case "thisMonth":
        setDateRange({ from: thisMonth, to: today });
        break;
      case "thisSeason":
        setDateRange({ from: thisSeason, to: today });
        break;
      case "thisYear":
        setDateRange({ from: thisYear, to: today });
        break;
      default:
        setDateRange(undefined);
    }
  };

  useEffect(() => {
    fetchProjects();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchContributionData();
  }, [selectedProject, selectedUser, dateRange]);

  const fetchProjects = async () => {
    try {
      const response = await fetch("/api/projects");
      const data = await response.json();
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchContributionData = async () => {
    setLoading(true);
    try {
      let url = "/api/contributions?";
      if (selectedProject !== "all") url += `projectId=${selectedProject}&`;
      if (selectedUser !== "all") url += `userId=${selectedUser}&`;
      if (dateRange) {
        url += `startDate=${dateRange.from?.toISOString()}&endDate=${dateRange.to?.toISOString()}`;
      }

      const response = await fetch(url);
      const data = await response.json();
      setContributionData(data);
    } catch (error) {
      console.error("Error fetching contribution data:", error);
    } finally {
      setLoading(false);
    }
  };

  const prepareChartData = () => {
    if (!contributionData?.users) return [];

    return Object.values(contributionData.users).map((user) => ({
      name: user.name,
      totalContribution: user.totalContribution,
    }));
  };

  const prepareUserProjectChartData = (userId: number) => {
    if (!contributionData?.users?.[userId]) return [];
    const user = contributionData.users[userId];

    return Object.values(user.projects).map((project: any) => ({
      name: project.title,
      contribution: project.totalContribution,
    }));
  };

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884d8",
    "#82ca9d",
    "#ffc658",
    "#ff7300",
  ];

  return (
    <div className="space-y-8 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-4xl font-bold tracking-tight">Contributions</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2">
          <label className="text-sm font-medium">Project</label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
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
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">User</label>
          <Select value={selectedUser} onValueChange={setSelectedUser}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id.toString()}>
                  {user.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Date Range</label>
          <div className="flex flex-col gap-2">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRangePreset("lastWeek")}
              >
                Last Week
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRangePreset("lastMonth")}
              >
                Last Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRangePreset("lastSeason")}
              >
                Last Season
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRangePreset("thisMonth")}
              >
                This Month
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRangePreset("thisSeason")}
              >
                This Season
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRangePreset("thisYear")}
              >
                This Year
              </Button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Total Contributions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChartData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="totalContribution" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(contributionData?.users || {}).map((user) => (
              <Card key={user.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {user.name}'s Project Contributions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={user.projectContributions || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {(user.projectContributions || []).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
