"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../lib/utils";
import {
  Home,
  FolderKanban,
  CheckSquare,
  Users,
  Folder,
  ClipboardList,
  BarChart,
} from "lucide-react";

const routes = [
  {
    label: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
  },
  {
    label: "Users",
    href: "/users",
    icon: Users,
  },
  {
    label: "Contributions",
    href: "/contributions",
    icon: BarChart,
  },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center space-x-1 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-2 rounded-full border shadow-sm">
      {routes.map((route) => {
        const Icon = route.icon;
        const isActive = pathname === route.href;
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-full transition-all",
              "hover:bg-muted hover:text-primary",
              isActive
                ? "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground"
                : "text-muted-foreground"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 transition-transform",
                isActive && "scale-110"
              )}
            />
            <span>{route.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
