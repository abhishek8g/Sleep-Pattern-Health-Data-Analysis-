import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 text-center px-6", className)}>
      <div className="w-14 h-14 rounded-2xl bg-white/3 border border-white/5 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-600" />
      </div>
      <h3 className="text-gray-300 font-medium text-base mb-1">{title}</h3>
      {description && <p className="text-gray-600 text-sm max-w-xs leading-relaxed">{description}</p>}
      {action && (
        <div className="mt-5">
          {action.href ? (
            <Link
              href={action.href}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {action.label} →
            </Link>
          ) : (
            <button
              onClick={action.onClick}
              className="text-sm text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              {action.label} →
            </button>
          )}
        </div>
      )}
    </div>
  );
}
