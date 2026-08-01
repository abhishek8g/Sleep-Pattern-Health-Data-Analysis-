"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { authApi } from "@/lib/api";

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleChange = (i: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const next = [...otp];
    next[i] = val.slice(-1);
    setOtp(next);
    if (val && i < 5) {
      document.getElementById(`otp-${i + 1}`)?.focus();
    }
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) {
      document.getElementById(`otp-${i - 1}`)?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length !== 6) { toast.error("Enter the 6-digit OTP"); return; }
    setLoading(true);
    try {
      await authApi.verifyEmail({ email, otp: code });
      toast.success("Email verified! You can now log in.");
      router.push("/login");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOTP(email);
      toast.success("New OTP sent to your email!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-6">
        <Mail className="w-8 h-8 text-indigo-400" />
      </div>
      <h1 className="text-3xl font-bold text-white mb-2">Check your email</h1>
      <p className="text-gray-400 mb-8">We sent a 6-digit code to<br /><span className="text-white font-medium">{email}</span></p>

      <div className="flex items-center justify-center gap-3 mb-8">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-12 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        ))}
      </div>

      <button onClick={handleVerify} disabled={loading || otp.join("").length !== 6}
        className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 mb-4">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Verifying..." : "Verify email"}
      </button>

      <button onClick={handleResend} disabled={resending}
        className="text-sm text-gray-500 hover:text-gray-300 flex items-center gap-1.5 mx-auto transition-colors">
        {resending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
        Resend code
      </button>
    </motion.div>
  );
}
