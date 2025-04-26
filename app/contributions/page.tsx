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
import { CalendarIcon } from "lucide-react";

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
            category: string;
          }>;
        };
      };
      projectContributions: Array<{
        name: string;
        value: number;
      }>;
      categoryContributions: {
        op: number;
        h5: number;
        architecture: number;
      };
      categoryContributionsArray: Array<{
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
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
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
  }, [selectedProject, selectedUser, selectedCategory, dateRange]);

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
      if (selectedCategory !== "all") url += `category=${selectedCategory}&`;
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
    "#0088FE", // Blue
    "#00C49F", // Teal
    "#FFBB28", // Yellow
    "#FF8042", // Orange
    "#8884d8", // Purple
    "#82ca9d", // Green
    "#ffc658", // Light Orange
    "#ff7300", // Dark Orange
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <BarChart className="h-8 w-8" />
          Contributions
        </h1>
      </div>

      {/* Filters Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project</label>
              <Select
                value={selectedProject}
                onValueChange={setSelectedProject}
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
              <label className="text-sm font-medium">Category</label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="op">OP</SelectItem>
                  <SelectItem value="h5">H5</SelectItem>
                  <SelectItem value="architecture">Architecture</SelectItem>
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
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Last Week
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangePreset("lastMonth")}
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Last Month
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDateRangePreset("lastSeason")}
                    className="flex items-center gap-2"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    Last Season
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Total Contributions Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Total Contributions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareChartData()}>
                    <defs>
                      <linearGradient
                        id="colorGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#4F46E5"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="95%"
                          stopColor="#818CF8"
                          stopOpacity={0.2}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: "#374151" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />
                    <YAxis
                      tick={{ fill: "#374151" }}
                      axisLine={{ stroke: "#E5E7EB" }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #E5E7EB",
                        borderRadius: "0.5rem",
                        color: "#374151",
                      }}
                      labelStyle={{ color: "#374151" }}
                      formatter={(value: number) => [
                        `${value.toFixed(2)}`,
                        "Contribution",
                      ]}
                    />
                    <Legend
                      formatter={(value) => (
                        <span className="text-gray-700">{value}</span>
                      )}
                    />
                    <Bar
                      dataKey="totalContribution"
                      fill="url(#colorGradient)"
                      radius={[4, 4, 0, 0]}
                      animationDuration={1500}
                      animationBegin={0}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* User Contributions Section */}
          <div className="grid gap-4 md:grid-cols-2">
            {Object.values(contributionData?.users || {}).map((user) => (
              <div key={user.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <PieChart className="h-5 w-5" />
                      {user.name}'s Contributions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      {/* Project Contributions */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">By Project</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={user.projectContributions || []}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
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
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "0.5rem",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap gap-2 justify-center mt-2">
                            {(user.projectContributions || []).map(
                              (entry, index) => (
                                <span
                                  key={entry.name}
                                  className="flex items-center gap-1 text-xs"
                                  style={{
                                    color: COLORS[index % COLORS.length],
                                  }}
                                >
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        COLORS[index % COLORS.length],
                                    }}
                                  ></span>
                                  {entry.name} ({entry.value})
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Category Contributions */}
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium">By Category</h3>
                        <div className="h-[250px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={user.categoryContributionsArray || []}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {(user.categoryContributionsArray || []).map(
                                  (entry, index) => (
                                    <Cell
                                      key={`cell-${index}`}
                                      fill={COLORS[index % COLORS.length]}
                                    />
                                  )
                                )}
                              </Pie>
                              <Tooltip
                                contentStyle={{
                                  backgroundColor: "hsl(var(--background))",
                                  border: "1px solid hsl(var(--border))",
                                  borderRadius: "0.5rem",
                                }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                          <div className="flex flex-wrap gap-2 justify-center mt-2">
                            {(user.categoryContributionsArray || []).map(
                              (entry, index) => (
                                <span
                                  key={entry.name}
                                  className="flex items-center gap-1 text-xs"
                                  style={{
                                    color: COLORS[index % COLORS.length],
                                  }}
                                >
                                  <span
                                    className="inline-block w-3 h-3 rounded-full"
                                    style={{
                                      backgroundColor:
                                        COLORS[index % COLORS.length],
                                    }}
                                  ></span>
                                  {entry.name} ({entry.value})
                                </span>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
