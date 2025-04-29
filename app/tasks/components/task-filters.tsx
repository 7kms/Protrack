"use client";

import { MultiSelect } from "@/app/components/ui/multi-select";
import { SelectItem } from "@/app/components/ui/select";
import { DateRangePicker } from "@/app/components/ui/date-range-picker";
import { Button } from "@/app/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";

interface FilterState {
  assignedToId: string[];
  projectId: string[];
  status: string[];
  priority: string[];
  category: string[];
  startDate: string;
  endDate: string;
}

interface TaskFiltersProps {
  assignedToId: string[];
  projectId: string[];
  status: string[];
  priority: string[];
  category: string[];
  dateRange: DateRange | undefined;
  users: { id: number; name: string; active: boolean }[];
  projects: { id: number; title: string }[];
  onFilterChange: (key: keyof FilterState, value: string[]) => void;
  onDateRangeChange: (range: DateRange | undefined) => void;
  onQuickFilter: (range: "week" | "month" | "season") => void;
  onClearDateFilter: () => void;
}

export function TaskFilters({
  assignedToId,
  projectId,
  status,
  priority,
  category,
  dateRange,
  users,
  projects,
  onFilterChange,
  onDateRangeChange,
  onQuickFilter,
  onClearDateFilter,
}: TaskFiltersProps) {
  const activeUsers = users.filter((user) => user.active);

  return (
    <div className="space-y-4">
      {/* User and Project Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MultiSelect
          value={assignedToId}
          onValueChange={(value) => onFilterChange("assignedToId", value)}
          placeholder="Filter by assignee"
          options={activeUsers.map((user) => ({
            value: user.id.toString(),
            label: user.name,
          }))}
        >
          {activeUsers.map((user) => (
            <SelectItem key={user.id} value={user.id.toString()}>
              {user.name}
            </SelectItem>
          ))}
        </MultiSelect>

        <MultiSelect
          value={projectId}
          onValueChange={(value) => onFilterChange("projectId", value)}
          placeholder="Filter by project"
          options={projects.map((project) => ({
            value: project.id.toString(),
            label: project.title,
          }))}
        >
          {projects.map((project) => (
            <SelectItem key={project.id} value={project.id.toString()}>
              {project.title}
            </SelectItem>
          ))}
        </MultiSelect>

        <MultiSelect
          value={status}
          onValueChange={(value) => onFilterChange("status", value)}
          placeholder="Filter by status"
          options={[
            { value: "not_started", label: "Not Started", color: "yellow" },
            { value: "developing", label: "Developing", color: "blue" },
            { value: "testing", label: "Testing", color: "purple" },
            { value: "online", label: "Online", color: "green" },
            { value: "suspended", label: "Suspended", color: "orange" },
            { value: "canceled", label: "Canceled", color: "red" },
          ]}
        >
          <SelectItem
            value="not_started"
            className="text-yellow-800 dark:text-yellow-200"
          >
            Not Started
          </SelectItem>
          <SelectItem
            value="developing"
            className="text-blue-800 dark:text-blue-200"
          >
            Developing
          </SelectItem>
          <SelectItem
            value="testing"
            className="text-purple-800 dark:text-purple-200"
          >
            Testing
          </SelectItem>
          <SelectItem
            value="online"
            className="text-green-800 dark:text-green-200"
          >
            Online
          </SelectItem>
          <SelectItem
            value="suspended"
            className="text-orange-800 dark:text-orange-200"
          >
            Suspended
          </SelectItem>
          <SelectItem
            value="canceled"
            className="text-red-800 dark:text-red-200"
          >
            Canceled
          </SelectItem>
        </MultiSelect>

        <MultiSelect
          value={priority}
          onValueChange={(value) => onFilterChange("priority", value)}
          placeholder="Filter by priority"
          options={[
            { value: "high", label: "High", color: "red" },
            { value: "medium", label: "Medium", color: "blue" },
            { value: "low", label: "Low", color: "green" },
          ]}
        >
          <SelectItem value="high" className="text-red-800 dark:text-red-200">
            High
          </SelectItem>
          <SelectItem
            value="medium"
            className="text-blue-800 dark:text-blue-200"
          >
            Medium
          </SelectItem>
          <SelectItem
            value="low"
            className="text-green-800 dark:text-green-200"
          >
            Low
          </SelectItem>
        </MultiSelect>

        <MultiSelect
          value={category}
          onValueChange={(value) => onFilterChange("category", value)}
          placeholder="Filter by category"
          options={[
            { value: "op", label: "OP", color: "blue" },
            { value: "h5", label: "H5", color: "purple" },
            { value: "web", label: "Web", color: "green" },
            { value: "architecture", label: "Architecture", color: "orange" },
          ]}
        >
          <SelectItem value="op" className="text-blue-800 dark:text-blue-200">
            OP
          </SelectItem>
          <SelectItem
            value="h5"
            className="text-purple-800 dark:text-purple-200"
          >
            H5
          </SelectItem>
          <SelectItem
            value="web"
            className="text-green-800 dark:text-green-200"
          >
            Web
          </SelectItem>
          <SelectItem
            value="architecture"
            className="text-orange-800 dark:text-orange-200"
          >
            Architecture
          </SelectItem>
        </MultiSelect>
      </div>

      {/* Date Range Filter */}
      <div className="flex flex-col gap-4">
        <div className="flex gap-4">
          <DateRangePicker value={dateRange} onChange={onDateRangeChange} />
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onQuickFilter("week")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Last Week
          </Button>
          <Button
            variant="outline"
            onClick={() => onQuickFilter("month")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Last Month
          </Button>
          <Button
            variant="outline"
            onClick={() => onQuickFilter("season")}
            className="flex items-center gap-2"
          >
            <CalendarIcon className="h-4 w-4" />
            Last Season
          </Button>
          <Button
            variant="outline"
            onClick={onClearDateFilter}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Date Filter
          </Button>
        </div>
      </div>
    </div>
  );
}
