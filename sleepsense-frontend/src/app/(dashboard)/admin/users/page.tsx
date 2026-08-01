import { AdminUsersPage } from "@/components/admin/AdminUsersPage";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Manage Users" };
export default function Page() { return <AdminUsersPage />; }
