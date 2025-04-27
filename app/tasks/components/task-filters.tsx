"use client";

import { MultiSelect } from "@/app/components/ui/multi-select";
import { SelectItem } from "@/app/components/ui/select";
import { DateRangePicker } from "@/app/components/ui/date-range-picker";
import { Button } from "@/app/components/ui/button";
import { CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { subWeeks, subMonths, subMonths as subSeasons } from "date-fns";

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
  users: { id: number; name: string }[];
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
  return (
    <div className="space-y-4">
      {/* User and Project Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MultiSelect
          value={assignedToId}
          onValueChange={(value) => onFilterChange("assignedToId", value)}
          placeholder="Filter by assignee"
          options={users.map((user) => ({
            value: user.id.toString(),
            label: user.name,
          }))}
        >
          {users.map((user) => (
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
            { value: "not_started", label: "Not Started" },
            { value: "developing", label: "Developing" },
            { value: "testing", label: "Testing" },
            { value: "online", label: "Online" },
            { value: "suspended", label: "Suspended" },
            { value: "canceled", label: "Canceled" },
          ]}
        >
          <SelectItem value="not_started">Not Started</SelectItem>
          <SelectItem value="developing">Developing</SelectItem>
          <SelectItem value="testing">Testing</SelectItem>
          <SelectItem value="online">Online</SelectItem>
          <SelectItem value="suspended">Suspended</SelectItem>
          <SelectItem value="canceled">Canceled</SelectItem>
        </MultiSelect>

        <MultiSelect
          value={priority}
          onValueChange={(value) => onFilterChange("priority", value)}
          placeholder="Filter by priority"
          options={[
            { value: "high", label: "High" },
            { value: "medium", label: "Medium" },
            { value: "low", label: "Low" },
          ]}
        >
          <SelectItem value="high">High</SelectItem>
          <SelectItem value="medium">Medium</SelectItem>
          <SelectItem value="low">Low</SelectItem>
        </MultiSelect>

        <MultiSelect
          value={category}
          onValueChange={(value) => onFilterChange("category", value)}
          placeholder="Filter by category"
          options={[
            { value: "op", label: "OP" },
            { value: "h5", label: "H5" },
            { value: "web", label: "Web" },
            { value: "architecture", label: "Architecture" },
          ]}
        >
          <SelectItem value="op">OP</SelectItem>
          <SelectItem value="h5">H5</SelectItem>
          <SelectItem value="web">Web</SelectItem>
          <SelectItem value="architecture">Architecture</SelectItem>
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
