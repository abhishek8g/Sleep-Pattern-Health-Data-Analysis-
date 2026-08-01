import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Dashboard" };
export default function DashboardPage() {
  return <DashboardOverview />;
}
