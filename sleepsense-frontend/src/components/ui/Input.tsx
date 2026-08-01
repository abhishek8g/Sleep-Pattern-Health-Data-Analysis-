import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, leftIcon, rightIcon, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-gray-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              "w-full bg-white/5 border rounded-xl px-4 py-3 text-white placeholder-gray-500",
              "focus:outline-none focus:ring-2 transition-all text-sm",
              error
                ? "border-red-500/50 focus:border-red-500/70 focus:ring-red-500/20"
                : "border-white/10 focus:border-indigo-500/70 focus:ring-indigo-500/20",
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="text-red-400 text-xs mt-1">{error}</p>}
        {hint && !error && <p className="text-gray-500 text-xs mt-1">{hint}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
