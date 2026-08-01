"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [showPass, setShowPass] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      const res = await authApi.login(data);
      const { access_token, refresh_token, user } = res.data;
      setAuth(user, access_token, refresh_token);
      toast.success(`Welcome back, ${user.full_name.split(" ")[0]}!`);
      router.push(user.role === "admin" ? "/admin/dashboard" : "/dashboard");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Login failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full"
    >
      <h1 className="text-3xl font-bold text-white mb-2">Welcome back</h1>
      <p className="text-gray-400 mb-8">Sign in to your SleepSense account</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <Link href="/forgot-password" className="text-xs text-indigo-400 hover:text-indigo-300">Forgot password?</Link>
          </div>
          <div className="relative">
            <input
              {...register("password")}
              type={showPass ? "text" : "password"}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-11 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPass(!showPass)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {isSubmitting ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm mt-6">
        Don't have an account?{" "}
        <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">Create one</Link>
      </p>


    </motion.div>
  );
}
