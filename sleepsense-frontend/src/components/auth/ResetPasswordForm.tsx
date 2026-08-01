"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

const schema = z.object({
  new_password: z.string().min(8, "Min 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, {
  message: "Passwords don't match", path: ["confirm_password"],
});

type Form = z.infer<typeof schema>;

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [showPass, setShowPass] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    if (!token) { toast.error("Invalid reset link"); return; }
    try {
      await authApi.resetPassword({ token, new_password: data.new_password });
      toast.success("Password reset! You can now log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Reset failed");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
        <Lock className="w-7 h-7 text-indigo-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Set new password</h1>
      <p className="text-gray-400 mb-8">Must be at least 8 characters.</p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {[
          { name: "new_password" as const, label: "New Password" },
          { name: "confirm_password" as const, label: "Confirm Password" },
        ].map(({ name, label }) => (
          <div key={name}>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
            <div className="relative">
              <input {...register(name)} type={showPass ? "text" : "password"} placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              {name === "new_password" && (
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              )}
            </div>
            {errors[name] && <p className="text-red-400 text-xs mt-1">{errors[name]?.message}</p>}
          </div>
        ))}
        <button type="submit" disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2">
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Resetting..." : "Reset password"}
        </button>
      </form>
    </motion.div>
  );
}
