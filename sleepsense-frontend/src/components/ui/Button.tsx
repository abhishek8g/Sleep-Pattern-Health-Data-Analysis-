import { forwardRef } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, icon, ...props }, ref) => {
    const base =
      "inline-flex items-center justify-center gap-2 font-medium transition-all rounded-xl disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a1a]";

    const variants = {
      primary:
        "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white focus:ring-indigo-500",
      secondary:
        "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-gray-300 hover:text-white focus:ring-white/20",
      outline:
        "border border-indigo-500/40 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/60 focus:ring-indigo-500",
      ghost:
        "text-gray-400 hover:text-white hover:bg-white/5 focus:ring-white/10",
      danger:
        "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 hover:border-red-500/40 focus:ring-red-500",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5",
      md: "text-sm px-4 py-2.5",
      lg: "text-base px-6 py-3",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
