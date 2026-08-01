"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { getInitials, formatDate, timeAgo } from "@/lib/utils";
import { Camera, Loader2, Shield, Database, Brain, FileText, Clock, LogOut } from "lucide-react";
import toast from "react-hot-toast";

const profileSchema = z.object({
  full_name: z.string().min(2, "Min 2 characters"),
  bio: z.string().max(300).optional(),
  phone: z.string().optional(),
  timezone: z.string().optional(),
});

type ProfileForm = z.infer<typeof profileSchema>;

const passwordSchema = z.object({
  current_password: z.string().min(1, "Required"),
  new_password: z.string().min(8, "Min 8 characters"),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: "Passwords don't match", path: ["confirm_password"] });

type PasswordForm = z.infer<typeof passwordSchema>;

export function ProfilePage() {
  const { user, updateUser, clearAuth } = useAuthStore();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<"profile" | "password" | "danger">("profile");
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: statsData } = useQuery({
    queryKey: ["user-stats"],
    queryFn: () => usersApi.getStats(),
  });

  const stats = statsData?.data;

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: user?.full_name || "",
      bio: user?.bio || "",
      phone: user?.phone || "",
      timezone: user?.timezone || "UTC",
    },
  });

  const { register: registerPwd, handleSubmit: handleSubmitPwd, formState: { errors: pwdErrors, isSubmitting: pwdSubmitting }, reset: resetPwd } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const updateMutation = useMutation({
    mutationFn: (data: ProfileForm) => usersApi.updateProfile(data),
    onSuccess: (res) => {
      updateUser(res.data);
      queryClient.invalidateQueries({ queryKey: ["user-stats"] });
      toast.success("Profile updated!");
    },
    onError: () => toast.error("Update failed"),
  });

  const avatarMutation = useMutation({
    mutationFn: (file: File) => usersApi.uploadAvatar(file),
    onSuccess: (res) => {
      updateUser({ avatar_url: res.data.avatar_url });
      toast.success("Avatar updated!");
    },
    onError: () => toast.error("Avatar upload failed"),
  });

  const passwordMutation = useMutation({
    mutationFn: (data: { current_password: string; new_password: string }) =>
      usersApi.changePassword(data),
    onSuccess: () => {
      resetPwd();
      toast.success("Password changed!");
    },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed"),
  });

  const deleteMutation = useMutation({
    mutationFn: () => usersApi.deleteAccount(),
    onSuccess: () => { clearAuth(); },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Profile Header Card */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white overflow-hidden">
              {user?.avatar_url
                ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                : getInitials(user?.full_name || "U")}
            </div>
            <button onClick={() => fileRef.current?.click()}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-indigo-500 hover:bg-indigo-600 flex items-center justify-center transition-colors">
              {avatarMutation.isPending ? <Loader2 className="w-3 h-3 text-white animate-spin" /> : <Camera className="w-3 h-3 text-white" />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => e.target.files?.[0] && avatarMutation.mutate(e.target.files[0])} />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-bold text-white">{user?.full_name}</h2>
            <p className="text-gray-400">@{user?.username} · {user?.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                user?.role === "admin"
                  ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
              }`}>{user?.role}</span>
              <span className="text-xs text-gray-500">Member since {user?.created_at ? formatDate(user.created_at) : "N/A"}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="hidden md:grid grid-cols-3 gap-4 text-center">
            {[
              { label: "Datasets", value: stats?.datasets_uploaded ?? 0, icon: Database },
              { label: "Predictions", value: stats?.predictions_made ?? 0, icon: Brain },
              { label: "Reports", value: stats?.reports_generated ?? 0, icon: FileText },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                <Icon className="w-4 h-4 text-gray-500 mx-auto mb-1" />
                <p className="text-xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1">
        {(["profile", "password", "danger"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
              tab === t
                ? t === "danger" ? "bg-red-500/20 text-red-400" : "bg-indigo-500/20 text-indigo-400"
                : "text-gray-500 hover:text-white hover:bg-white/5"
            }`}>
            {t === "danger" ? "Danger Zone" : t}
          </button>
        ))}
      </div>

      {/* Profile Form */}
      {tab === "profile" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/5 bg-white/3 p-6">
          <h3 className="font-semibold text-white mb-5">Edit Profile</h3>
          <form onSubmit={handleSubmit((d) => updateMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
              <input {...register("full_name")} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
              {errors.full_name && <p className="text-red-400 text-xs mt-1">{errors.full_name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Bio</label>
              <textarea {...register("bio")} rows={3} placeholder="Tell us about yourself..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Phone</label>
                <input {...register("phone")} placeholder="+1 (555) 000-0000"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Timezone</label>
                <select {...register("timezone")}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all">
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="America/Chicago">Central Time</option>
                  <option value="America/Los_Angeles">Pacific Time</option>
                  <option value="Europe/London">London</option>
                  <option value="Asia/Kolkata">India (IST)</option>
                </select>
              </div>
            </div>
            <button type="submit" disabled={isSubmitting || updateMutation.isPending}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium text-white transition-all flex items-center gap-2">
              {(isSubmitting || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </form>
        </motion.div>
      )}

      {/* Password Form */}
      {tab === "password" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-white/5 bg-white/3 p-6">
          <h3 className="font-semibold text-white mb-5">Change Password</h3>
          <form onSubmit={handleSubmitPwd((d) => passwordMutation.mutate(d))} className="space-y-4 max-w-md">
            {[
              { name: "current_password" as const, label: "Current Password" },
              { name: "new_password" as const, label: "New Password" },
              { name: "confirm_password" as const, label: "Confirm New Password" },
            ].map(({ name, label }) => (
              <div key={name}>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
                <input {...registerPwd(name)} type="password"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500/50 transition-all" />
                {pwdErrors[name] && <p className="text-red-400 text-xs mt-1">{pwdErrors[name]?.message}</p>}
              </div>
            ))}
            <button type="submit" disabled={pwdSubmitting || passwordMutation.isPending}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium text-white transition-all flex items-center gap-2">
              {(pwdSubmitting || passwordMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin" />}
              Change Password
            </button>
          </form>
        </motion.div>
      )}

      {/* Danger Zone */}
      {tab === "danger" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6">
          <h3 className="font-semibold text-red-400 mb-2">Danger Zone</h3>
          <p className="text-gray-400 text-sm mb-6">These actions are irreversible. Please be careful.</p>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/3">
              <div>
                <p className="text-white font-medium text-sm">Delete Account</p>
                <p className="text-gray-500 text-xs mt-0.5">Permanently delete your account and all data</p>
              </div>
              <button onClick={() => {
                if (confirm("Are you sure you want to delete your account? This cannot be undone.")) {
                  deleteMutation.mutate();
                }
              }}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 text-sm font-medium transition-all flex items-center gap-2">
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete Account
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
