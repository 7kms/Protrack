import { Metadata } from "next";
import { Dashboard } from "./components/dashboard";
import { Activity } from "lucide-react";

export const metadata: Metadata = {
  title: "ProTrack - Dashboard",
  description: "Work Statistics System",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      <div className="flex items-center justify-between border-b pb-4">
        <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent flex items-center gap-2">
          <Activity className="h-8 w-8" />
          Dashboard
        </h1>
      </div>
      <div className="p-6">
        <Dashboard />
      </div>
    </main>
  );
}
