"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { adminApi } from "@/lib/api";
import { formatDate, getStatusBadge, getInitials } from "@/lib/utils";
import type { User } from "@/types";
import toast from "react-hot-toast";
import {
  Users, Search, ChevronLeft, ChevronRight, Shield, Ban, CheckCircle,
  Trash2, UserCheck, Loader2
} from "lucide-react";

export function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", page, search, roleFilter, statusFilter],
    queryFn: () => adminApi.listUsers({ page, per_page: 15, search: search || undefined, role: roleFilter || undefined, status: statusFilter || undefined }),
    placeholderData: (prev) => prev,
  });

  const suspend = useMutation({
    mutationFn: (id: string) => adminApi.suspendUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User suspended"); },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed"),
  });

  const activate = useMutation({
    mutationFn: (id: string) => adminApi.activateUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User activated"); },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("User deleted"); },
    onError: (err: any) => toast.error(err.response?.data?.detail || "Failed"),
  });

  const assignRole = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) => adminApi.assignRole(id, role),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-users"] }); toast.success("Role assigned"); },
  });

  const users: User[] = data?.data?.items || [];
  const pagination = data?.data;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
          <Users className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Users</h1>
          <p className="text-gray-400 text-sm">{pagination?.total || 0} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input type="text" placeholder="Search users..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 transition-all" />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50">
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-gray-300 focus:outline-none focus:border-indigo-500/50">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="suspended">Suspended</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(8)].map((_, i) => <div key={i} className="h-14 skeleton rounded-xl" />)}</div>
        ) : (
          <>
            <div className="px-6 py-3 border-b border-white/5 grid grid-cols-12 text-xs text-gray-500 font-medium uppercase tracking-wider">
              <span className="col-span-4">User</span>
              <span className="col-span-2">Role</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2">Joined</span>
              <span className="col-span-2 text-right">Actions</span>
            </div>
            {users.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-center">
                <Users className="w-12 h-12 text-gray-600 mb-3" />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {users.map((u) => (
                  <motion.div key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="px-6 py-3 grid grid-cols-12 items-center hover:bg-white/3 transition-colors">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white overflow-hidden flex-shrink-0">
                        {u.avatar_url ? <img src={u.avatar_url} alt="" className="w-full h-full object-cover" /> : getInitials(u.full_name)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-white truncate">{u.full_name}</p>
                        <p className="text-xs text-gray-500 truncate">{u.email}</p>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        u.role === "admin"
                          ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                          : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                      }`}>{u.role}</span>
                    </div>
                    <div className="col-span-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${getStatusBadge(u.status)}`}>{u.status}</span>
                    </div>
                    <span className="col-span-2 text-xs text-gray-500">{formatDate(u.created_at, "MMM dd, yyyy")}</span>
                    <div className="col-span-2 flex items-center gap-1 justify-end">
                      {u.status === "active" ? (
                        <button onClick={() => suspend.mutate(u.id)} title="Suspend"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-yellow-400 hover:bg-yellow-500/10 transition-all">
                          <Ban className="w-3.5 h-3.5" />
                        </button>
                      ) : (
                        <button onClick={() => activate.mutate(u.id)} title="Activate"
                          className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-green-500/10 transition-all">
                          <CheckCircle className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => assignRole.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })} title="Toggle Role"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-all">
                        <Shield className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => { if (confirm(`Delete ${u.email}?`)) deleteUser.mutate(u.id); }} title="Delete"
                        className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">Page {page} of {pagination.pages} · {pagination.total} users</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setPage(page - 1)} disabled={page === 1}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-40">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => setPage(page + 1)} disabled={page >= pagination.pages}
              className="p-2 rounded-lg border border-white/10 text-gray-400 hover:text-white disabled:opacity-40">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
