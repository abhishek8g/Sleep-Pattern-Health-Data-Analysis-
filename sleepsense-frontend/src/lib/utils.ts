import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatDate(date: string | Date, fmt = "MMM dd, yyyy"): string {
  return format(new Date(date), fmt);
}

export function timeAgo(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatPercent(value: number | null | undefined, decimals = 1): string {
  if (value === null || value === undefined) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatScore(value: number | null | undefined, decimals = 4): string {
  if (value === null || value === undefined) return "N/A";
  return value.toFixed(decimals);
}

export function getStatusColor(status: string): string {
  const map: Record<string, string> = {
    ready: "text-green-500",
    active: "text-green-500",
    completed: "text-green-500",
    processing: "text-yellow-500",
    running: "text-yellow-500",
    uploading: "text-blue-500",
    pending: "text-blue-500",
    failed: "text-red-500",
    suspended: "text-red-500",
  };
  return map[status] || "text-muted-foreground";
}

export function getStatusBadge(status: string): string {
  const map: Record<string, string> = {
    ready: "bg-green-500/10 text-green-500 border-green-500/20",
    active: "bg-green-500/10 text-green-500 border-green-500/20",
    completed: "bg-green-500/10 text-green-500 border-green-500/20",
    processing: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    running: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    uploading: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    pending: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    failed: "bg-red-500/10 text-red-500 border-red-500/20",
    suspended: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return map[status] || "bg-muted text-muted-foreground border-border";
}

export function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength) + "…";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function scoreToGrade(score: number): { grade: string; color: string } {
  if (score >= 0.9) return { grade: "A+", color: "text-green-500" };
  if (score >= 0.8) return { grade: "A", color: "text-green-400" };
  if (score >= 0.7) return { grade: "B", color: "text-yellow-500" };
  if (score >= 0.6) return { grade: "C", color: "text-orange-500" };
  return { grade: "D", color: "text-red-500" };
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
