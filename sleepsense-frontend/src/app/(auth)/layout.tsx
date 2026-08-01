import Link from "next/link";
import { Moon } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a1a] flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-950 flex-col justify-between p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
        </div>

        <Link href="/" className="flex items-center gap-2 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Moon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">SleepSense AI</span>
        </Link>

        <div className="relative z-10">
          <blockquote className="text-2xl font-medium text-white/90 leading-relaxed mb-6">
            "Understanding your sleep is the first step to transforming your health."
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-sm font-bold text-white">AI</div>
            <div>
              <div className="text-white font-medium text-sm">SleepSense AI</div>
              <div className="text-white/50 text-xs">Powered by Gemini + 8 ML models</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-8 text-white/40 text-sm relative z-10">
          <span>8+ ML Models</span>
          <span>·</span>
          <span>Gemini AI</span>
          <span>·</span>
          <span>Enterprise Security</span>
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Moon className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">SleepSense AI</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
