"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion } from "framer-motion";
import { Loader2, Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";

const schema = z.object({ email: z.string().email("Enter a valid email") });
type Form = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: Form) => {
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch {
      // Always show success to not reveal emails
      setSent(true);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full">
      {sent ? (
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
          <p className="text-gray-400 mb-6">If an account with that email exists, we've sent a password reset link.</p>
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 text-sm flex items-center justify-center gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
        </div>
      ) : (
        <>
          <Link href="/login" className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-300 mb-8 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to login
          </Link>
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6">
            <Mail className="w-7 h-7 text-indigo-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Forgot password?</h1>
          <p className="text-gray-400 mb-8">No worries — we'll send you a reset link.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
              <input {...register("email")} type="email" placeholder="you@example.com"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <button type="submit" disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2">
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              {isSubmitting ? "Sending..." : "Send reset link"}
            </button>
          </form>
        </>
      )}
    </motion.div>
  );
}
