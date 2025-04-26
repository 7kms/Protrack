import { Metadata } from "next";
import { Dashboard } from "./components/dashboard";

export const metadata: Metadata = {
  title: "ProTrack - Dashboard",
  description: "Work Statistics System",
};

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col p-6">
      <Dashboard />
    </main>
  );
}
