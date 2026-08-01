"use client";

import { Brain, Database, Clock } from "lucide-react";
import { timeAgo, getStatusColor } from "@/lib/utils";
import type { Dataset, Prediction } from "@/types";

interface Props {
  predictions: Prediction[];
  datasets: Dataset[];
}

export function RecentActivity({ predictions, datasets }: Props) {
  const activities = [
    ...datasets.slice(0, 3).map((d) => ({
      id: d.id,
      type: "dataset" as const,
      label: `Uploaded ${d.name}`,
      status: d.status,
      time: d.created_at,
    })),
    ...predictions.slice(0, 3).map((p) => ({
      id: p.id,
      type: "prediction" as const,
      label: `${p.prediction_type.replace("_", " ")} prediction`,
      status: p.status,
      time: p.created_at,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

  return (
    <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
      <h3 className="font-semibold text-white mb-4">Recent Activity</h3>
      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Clock className="w-8 h-8 text-gray-600 mb-2" />
          <p className="text-gray-500 text-sm">No activity yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={`${activity.type}-${activity.id}`} className="flex items-start gap-3">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                activity.type === "dataset" ? "bg-blue-500/10" : "bg-purple-500/10"
              }`}>
                {activity.type === "dataset"
                  ? <Database className="w-3.5 h-3.5 text-blue-400" />
                  : <Brain className="w-3.5 h-3.5 text-purple-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white capitalize truncate">{activity.label}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-xs capitalize ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                  <span className="text-gray-600 text-xs">·</span>
                  <span className="text-xs text-gray-500">{timeAgo(activity.time)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
