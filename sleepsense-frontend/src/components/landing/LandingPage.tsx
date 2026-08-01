"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain, BarChart2, Shield, Zap, Users, Moon,
  ArrowRight, Star, CheckCircle2, ChevronRight
} from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 backdrop-blur-xl border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Moon className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg">SleepSense AI</span>
        </Link>
        <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
          <Link href="#features" className="hover:text-white transition-colors">Features</Link>
          <Link href="#how-it-works" className="hover:text-white transition-colors">How it works</Link>
          <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="#testimonials" className="hover:text-white transition-colors">Testimonials</Link>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
            Sign in
          </Link>
          <Link href="/register" className="text-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-4 py-2 rounded-lg font-medium transition-all">
            Get started free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 text-center relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 left-1/4 w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-3xl" />
        </div>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-4xl mx-auto relative"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-sm text-indigo-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Powered by Gemini AI + 8 ML Models
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Understand your{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              sleep patterns
            </span>{" "}
            with AI
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Upload your sleep data. Get AI-powered analysis, predictions, and personalized health recommendations — all in one beautiful dashboard.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25">
              Start for free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="flex items-center gap-2 border border-white/10 hover:border-white/20 px-8 py-4 rounded-xl font-medium text-gray-300 hover:text-white transition-all">
              View demo <ChevronRight className="w-5 h-5" />
            </Link>
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
            {["No credit card required", "Free tier available", "HIPAA-ready architecture"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-green-500" /> {item}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="py-16 px-6 border-y border-white/5">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "8+", label: "ML Models" },
            { value: "99.9%", label: "Uptime" },
            { value: "50MB", label: "Max Upload" },
            { value: "∞", label: "Insights" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl font-bold gradient-text">{stat.value}</div>
              <div className="text-gray-500 mt-1">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Everything you need to analyze sleep health</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              From raw data to actionable insights — SleepSense AI handles the full pipeline.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/3 hover:bg-white/5 hover:border-indigo-500/30 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${feature.iconBg}`}>
                  <feature.icon className={`w-5 h-5 ${feature.iconColor}`} />
                </div>
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-gray-400 text-lg">Start free. Scale as you grow.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {PRICING.map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`p-8 rounded-2xl border ${plan.featured ? "border-indigo-500/50 bg-indigo-500/5" : "border-white/5 bg-white/3"}`}
              >
                {plan.featured && (
                  <div className="inline-block bg-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1 rounded-full mb-4">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-4xl font-bold mb-1">
                  {plan.price}<span className="text-lg text-gray-400 font-normal">/mo</span>
                </div>
                <p className="text-gray-400 text-sm mb-6">{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />{f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center py-3 rounded-xl font-medium transition-all ${
                    plan.featured
                      ? "bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700"
                      : "border border-white/10 hover:border-white/20 text-gray-300 hover:text-white"
                  }`}
                >
                  Get started
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4">Trusted by health researchers</h2>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-6 rounded-2xl border border-white/5 bg-white/3"
              >
                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, j) => <Star key={j} className="w-4 h-4 fill-yellow-500 text-yellow-500" />)}
                </div>
                <p className="text-gray-300 text-sm leading-relaxed mb-4">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold">
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{t.name}</div>
                    <div className="text-xs text-gray-500">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-4">Ready to understand your sleep?</h2>
            <p className="text-gray-400 text-lg mb-8">Join thousands of users improving their health with AI-powered insights.</p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-10 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg shadow-indigo-500/25">
              Get started for free <ArrowRight className="w-5 h-5" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <span className="font-semibold">SleepSense AI</span>
          </div>
          <p className="text-gray-500 text-sm">© 2024 SleepSense AI. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

const FEATURES = [
  { icon: BarChart2, title: "Exploratory Data Analysis", desc: "Auto-generate heatmaps, histograms, scatter plots, and correlation matrices from your data.", iconBg: "bg-blue-500/10", iconColor: "text-blue-400" },
  { icon: Brain, title: "8+ ML Models", desc: "Train Random Forest, XGBoost, LightGBM, Neural Networks and more — auto-select the best.", iconBg: "bg-purple-500/10", iconColor: "text-purple-400" },
  { icon: Zap, title: "Gemini AI Insights", desc: "Ask questions like 'Why is my sleep quality low?' and get instant AI-powered explanations.", iconBg: "bg-yellow-500/10", iconColor: "text-yellow-400" },
  { icon: Shield, title: "Secure & Private", desc: "JWT auth, encrypted passwords, RBAC, rate limiting — enterprise-grade security built in.", iconBg: "bg-green-500/10", iconColor: "text-green-400" },
  { icon: Users, title: "Admin Dashboard", desc: "Full user management, activity logs, system stats, and analytics for platform administrators.", iconBg: "bg-red-500/10", iconColor: "text-red-400" },
  { icon: Moon, title: "Sleep Predictions", desc: "Predict sleep quality, stress levels, and heart rate risk with confidence scores and SHAP explanations.", iconBg: "bg-indigo-500/10", iconColor: "text-indigo-400" },
];

const PRICING = [
  {
    name: "Free", price: "$0", desc: "Perfect for individuals", featured: false,
    features: ["5 datasets/month", "Basic EDA", "3 ML models", "PDF reports", "Email notifications"],
  },
  {
    name: "Pro", price: "$29", desc: "For serious health researchers", featured: true,
    features: ["Unlimited datasets", "Full EDA suite", "All 8+ ML models", "Gemini AI chat", "Priority support", "Advanced reports"],
  },
  {
    name: "Enterprise", price: "$99", desc: "For teams & organizations", featured: false,
    features: ["Everything in Pro", "Custom ML models", "Dedicated support", "SLA guarantee", "SSO & SAML", "Audit logs"],
  },
];

const TESTIMONIALS = [
  {
    name: "Dr. Sarah Chen", role: "Sleep Researcher, Stanford",
    quote: "SleepSense AI cut our analysis time by 80%. The AI explanations are remarkably accurate for a general-purpose tool.",
  },
  {
    name: "James Wilson", role: "Clinical Data Analyst",
    quote: "The automated data cleaning alone is worth it. What used to take hours of pandas wrangling now happens instantly.",
  },
  {
    name: "Priya Sharma", role: "Health Tech Startup Founder",
    quote: "We embedded SleepSense AI into our patient monitoring workflow. The prediction models are surprisingly robust.",
  },
];
