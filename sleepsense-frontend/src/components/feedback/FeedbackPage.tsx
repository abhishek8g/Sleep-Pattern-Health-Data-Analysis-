"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { timeAgo } from "@/lib/utils";
import { MessageSquare, Star, Loader2, Send, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const schema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  rating: z.number().min(1).max(5).optional(),
});
type FeedbackForm = z.infer<typeof schema>;

export function FeedbackPage() {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const { data: myFeedback } = useQuery({
    queryKey: ["my-feedback"],
    queryFn: () => api.get("/feedback/"),
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FeedbackForm>({
    resolver: zodResolver(schema),
  });

  const submitMutation = useMutation({
    mutationFn: (data: FeedbackForm) => api.post("/feedback/", { ...data, rating: rating || undefined }),
    onSuccess: () => {
      toast.success("Feedback submitted! Thank you.");
      reset();
      setRating(0);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 3000);
    },
    onError: () => toast.error("Failed to submit feedback"),
  });

  const feedbackItems = myFeedback?.data?.items || [];

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Feedback</h1>
        <p className="text-gray-400 mt-1">Help us improve SleepSense AI with your feedback</p>
      </div>

      {/* Submit form */}
      <div className="rounded-2xl border border-white/5 bg-white/3 p-6">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" />
          Send Feedback
        </h2>

        {submitted ? (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-8 text-center">
            <CheckCircle className="w-12 h-12 text-green-400 mb-3" />
            <p className="text-white font-medium">Thank you for your feedback!</p>
            <p className="text-gray-500 text-sm mt-1">We'll review it shortly.</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit((d) => submitMutation.mutate(d))} className="space-y-4">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Rating (optional)</label>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star === rating ? 0 : star)}
                    className="transition-transform hover:scale-110">
                    <Star className={`w-6 h-6 ${
                      star <= (hoverRating || rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-600"
                    }`} />
                  </button>
                ))}
                {rating > 0 && (
                  <span className="text-xs text-gray-500 ml-2">
                    {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Subject</label>
              <input {...register("subject")} placeholder="Brief description of your feedback"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 transition-all" />
              {errors.subject && <p className="text-red-400 text-xs mt-1">{errors.subject.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Message</label>
              <textarea {...register("message")} rows={4}
                placeholder="Tell us what you think, report a bug, or suggest a feature..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/70 focus:ring-2 focus:ring-indigo-500/20 resize-none transition-all" />
              {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
            </div>

            <button type="submit" disabled={isSubmitting || submitMutation.isPending}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 px-6 py-2.5 rounded-xl font-medium text-white transition-all">
              {(isSubmitting || submitMutation.isPending)
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <Send className="w-4 h-4" />}
              Submit Feedback
            </button>
          </form>
        )}
      </div>

      {/* Previous feedback */}
      {feedbackItems.length > 0 && (
        <div className="rounded-2xl border border-white/5 bg-white/3 overflow-hidden">
          <div className="px-6 py-4 border-b border-white/5">
            <h2 className="font-semibold text-white">Your Previous Feedback</h2>
          </div>
          <div className="divide-y divide-white/5">
            {feedbackItems.map((f: any) => (
              <motion.div key={f.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="px-6 py-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white">{f.subject}</p>
                    <p className="text-sm text-gray-400 mt-1">{f.message}</p>
                    {f.admin_reply && (
                      <div className="mt-3 pl-3 border-l-2 border-indigo-500/40">
                        <p className="text-xs text-indigo-400 font-medium mb-1">Admin Reply</p>
                        <p className="text-sm text-gray-300">{f.admin_reply}</p>
                      </div>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {f.rating && (
                        <div className="flex items-center gap-0.5">
                          {[...Array(f.rating)].map((_: any, i: number) => (
                            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        </div>
                      )}
                      <span className="text-xs text-gray-600">{timeAgo(f.created_at)}</span>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${
                    f.status === "open"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : f.status === "reviewed"
                      ? "bg-green-500/10 text-green-400 border-green-500/20"
                      : "bg-white/5 text-gray-500 border-white/10"
                  }`}>{f.status}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
