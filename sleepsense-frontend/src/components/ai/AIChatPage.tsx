"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { aiApi, datasetsApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/lib/utils";
import { Brain, Send, Bot, User, Loader2, Sparkles, Database } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_PROMPTS = [
  "Why is my sleep quality low?",
  "What affects sleep duration the most?",
  "Explain these charts to me.",
  "Suggest health improvements based on my data.",
  "What is my overall sleep health score?",
  "How can I reduce stress levels?",
];

export function AIChatPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: `Hi ${user?.full_name?.split(" ")[0]}! 👋 I'm your SleepSense AI assistant. I can help you understand your sleep data, explain predictions, and provide personalized health recommendations.\n\nTry asking me something like "Why is my sleep quality low?" or select one of the quick prompts below.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDataset, setSelectedDataset] = useState<string>("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: datasetsData } = useQuery({
    queryKey: ["datasets-list-ai"],
    queryFn: () => datasetsApi.list({ per_page: 20, status: "ready" }),
  });

  const datasets = datasetsData?.data?.items || [];

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiApi.chat(text, selectedDataset || undefined);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: res.data.answer,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      const errMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm having trouble connecting right now. Please check your API key and try again.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">AI Assistant</h1>
            <p className="text-gray-500 text-xs">Powered by Gemini AI</p>
          </div>
        </div>

        {/* Dataset selector */}
        {datasets.length > 0 && (
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-gray-500" />
            <select
              value={selectedDataset}
              onChange={(e) => setSelectedDataset(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-indigo-500/50 max-w-[160px]"
            >
              <option value="">No dataset context</option>
              {datasets.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-1 scrollbar-hide">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === "assistant"
                  ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                  : "bg-white/10 border border-white/10"
              }`}>
                {msg.role === "assistant"
                  ? <Bot className="w-4 h-4 text-white" />
                  : <User className="w-4 h-4 text-gray-300" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "assistant"
                  ? "bg-white/5 border border-white/5 text-gray-200"
                  : "bg-indigo-500/20 border border-indigo-500/20 text-white"
              }`}>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                <p className="text-xs text-gray-600 mt-1.5">
                  {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-white/5 border border-white/5 rounded-2xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
              <span className="text-gray-400 text-sm">Thinking...</span>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick Prompts */}
      <div className="py-3 flex gap-2 overflow-x-auto scrollbar-hide">
        {QUICK_PROMPTS.map((prompt) => (
          <button key={prompt} onClick={() => sendMessage(prompt)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:border-indigo-500/40 transition-all flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-400" />
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="flex gap-3 items-end">
        <div className="flex-1 relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendMessage(input);
              }
            }}
            placeholder="Ask about your sleep health data..."
            rows={1}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/50 resize-none text-sm transition-all"
          />
        </div>
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || loading}
          className="w-11 h-11 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 flex items-center justify-center flex-shrink-0 transition-all"
        >
          {loading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Send className="w-4 h-4 text-white" />}
        </button>
      </div>
    </div>
  );
}
