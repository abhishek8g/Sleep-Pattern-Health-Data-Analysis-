"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Moon, Sun, Monitor, Bell, Mail, Globe, Loader2 } from "lucide-react";

export function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: (data: any) => usersApi.updateProfile(data),
    onSuccess: (res) => { updateUser(res.data); toast.success("Settings saved"); },
    onError: () => toast.error("Failed to save settings"),
  });

  const handleToggle = (field: string, value: boolean) => {
    updateMutation.mutate({ [field]: value });
  };

  const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: () => void }) => (
    <button onClick={onChange}
      className={`relative w-10 h-6 rounded-full transition-colors ${checked ? "bg-indigo-500" : "bg-white/10"}`}>
      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-sm ${
        checked ? "translate-x-5" : "translate-x-1"
      }`} />
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>

      {/* Appearance */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
        <h3 className="font-semibold text-white mb-4">Appearance</h3>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "light", label: "Light", icon: Sun },
            { value: "dark", label: "Dark", icon: Moon },
            { value: "system", label: "System", icon: Monitor },
          ].map(({ value, label, icon: Icon }) => (
            <button key={value} onClick={() => setTheme(value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${
                theme === value
                  ? "border-indigo-500/50 bg-indigo-500/10 text-indigo-400"
                  : "border-white/5 text-gray-500 hover:border-white/10 hover:text-gray-300"
              }`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
        <h3 className="font-semibold text-white mb-4">Notifications</h3>
        <div className="space-y-4">
          {[
            { key: "email_notifications", label: "Email Notifications", desc: "Receive weekly health reports and alerts via email", icon: Mail },
            { key: "push_notifications", label: "Push Notifications", desc: "Get notified when predictions complete or data is processed", icon: Bell },
          ].map(({ key, label, desc, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-xs text-gray-500">{desc}</p>
                </div>
              </div>
              <ToggleSwitch
                checked={user?.[key as keyof typeof user] as boolean ?? true}
                onChange={() => handleToggle(key, !(user?.[key as keyof typeof user]))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Language & Region */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
          <Globe className="w-4 h-4 text-gray-400" /> Language & Region
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Language</label>
            <select
              value={user?.language || "en"}
              onChange={(e) => updateMutation.mutate({ language: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50"
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="hi">Hindi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Timezone</label>
            <select
              value={user?.timezone || "UTC"}
              onChange={(e) => updateMutation.mutate({ timezone: e.target.value })}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-indigo-500/50"
            >
              <option value="UTC">UTC</option>
              <option value="America/New_York">Eastern (ET)</option>
              <option value="America/Chicago">Central (CT)</option>
              <option value="America/Los_Angeles">Pacific (PT)</option>
              <option value="Europe/London">London</option>
              <option value="Asia/Kolkata">India (IST)</option>
              <option value="Asia/Tokyo">Tokyo (JST)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
