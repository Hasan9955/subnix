"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useGetSubmissionStatsQuery } from "@/redux/api/submissionApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowRight,
  CheckCircle2,
  Code2,
  ShieldCheck,
  BarChart3,
  Lock,
  Layers,
  Database,
  Terminal,
  Zap,
  Sparkles,
  FileCheck,
  Shield,
  UserCheck,
  Cpu,
} from "lucide-react";

export default function HomePage() {
  const { data: statsData, isLoading: isStatsLoading } = useGetSubmissionStatsQuery(undefined);
  const stats = statsData?.data;

  return (
    <div className="relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-blue-400/15 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-20 right-1/4 w-[450px] h-[450px] bg-purple-400/15 rounded-full blur-3xl" />
      </div>

      {/* 1. HERO SECTION */}
      <section className="pt-16 pb-20 sm:pt-24 sm:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto mb-14">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-8 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-blue-600 animate-ping" />
            Next-Generation Code Review &amp; Evaluation Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl font-black text-slate-900 tracking-tight leading-[1.15] mb-6">
            Transparent Project Submissions. <br />
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Frictionless Mentor Reviews.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-slate-600 leading-relaxed max-w-2xl mx-auto mb-10">
            The premier code evaluation and project handoff ecosystem designed for developer bootcamps, university cohorts, and engineering teams. Deliver structured mentor feedback, eliminate duplicate submissions, and track developer progress in real time.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/submit">
              <Button size="lg" className="gap-2.5 shadow-md shadow-blue-500/20 px-7">
                <Code2 className="w-5 h-5" />
                Submit a Project
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="gap-2.5 px-7 border-slate-300">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Open Mentor Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* 2. HERO IMAGE SHOWCASE WITH FLOATING BADGES */}
        <div className="relative max-w-5xl mx-auto mt-6">
          {/* Browser Mockup Window */}
          <div className="bg-slate-900/5 rounded-2xl p-2.5 sm:p-4 border border-slate-200/80 shadow-2xl backdrop-blur">
            <div className="bg-white rounded-xl overflow-hidden border border-slate-200">
              {/* Window Header */}
              <div className="px-4 py-3 bg-slate-100/90 border-b border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" />
                  <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" />
                </div>
                <div className="px-4 py-1 rounded-md bg-white border border-slate-200 text-xs text-slate-500 font-mono flex items-center gap-2 max-w-xs w-full justify-center shadow-xs">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  subnix.io/dashboard/evaluations
                </div>
                <div className="text-xs text-slate-400 font-medium hidden sm:block">
                  Live Preview
                </div>
              </div>

              {/* Hero Preview Image */}
              <div className="relative aspect-[16/9] w-full bg-slate-50">
                <Image
                  src="/hero-preview.jpg"
                  alt="Subnix Submission and Mentor Review Dashboard Preview"
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Floating Feature Badges */}
          <div className="hidden lg:flex items-center gap-3 absolute -top-5 -left-8 glass-panel px-4 py-2.5 rounded-xl border border-slate-200 shadow-lg animate-float-slow">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Anti-Duplicate Guard</div>
              <div className="text-[10px] text-slate-500">Repository uniqueness enforced</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 absolute top-1/3 -right-10 glass-panel px-4 py-2.5 rounded-xl border border-slate-200 shadow-lg animate-float-reverse">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Real-Time Evaluation Queue</div>
              <div className="text-[10px] text-slate-500">Instant mentor cache synchronization</div>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-3 absolute -bottom-6 left-12 glass-panel px-4 py-2.5 rounded-xl border border-slate-200 shadow-lg animate-float-slow">
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-800">Spam Protection</div>
              <div className="text-[10px] text-slate-500">Strict rate-limiting enabled</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. PLATFORM ACTIVITY & SUBMISSION METRICS */}
      <section id="metrics" className="border-y border-slate-200 bg-white py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Platform Activity &amp; Live Evaluation Metrics
              </span>
            </div>
            <Link
              href="/dashboard"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              Open Live Review Dashboard <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-center">
              <span className="text-xs text-slate-500 font-medium">Total Submissions</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {isStatsLoading ? "..." : stats?.totalSubmissions ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-center">
              <span className="text-xs text-amber-700 font-medium">Pending Reviews</span>
              <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-1">
                {isStatsLoading ? "..." : stats?.totalPending ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-center">
              <span className="text-xs text-emerald-700 font-medium">Approved Projects</span>
              <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-1">
                {isStatsLoading ? "..." : stats?.totalApproved ?? 0}
              </div>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100 text-center">
              <span className="text-xs text-blue-700 font-medium">Approval Ratio</span>
              <div className="text-2xl sm:text-3xl font-black text-blue-700 mt-1">
                {isStatsLoading ? "..." : `${stats?.approvalRatePercentage ?? 0}%`}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. INTERACTIVE SANDBOX DEMO ENVIRONMENT */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="max-w-2xl relative z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-4 border border-blue-400/30">
              <Sparkles className="w-3.5 h-3.5" /> Interactive Sandbox Environment
            </span>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
              Explore Subnix with Pre-Configured Demo Accounts
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-6">
              Experience the platform from either perspective: explore the Mentor review suite or test the developer submission workflow with our demo environments.
            </p>

            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-purple-400 uppercase">Lead Mentor</span>
                  <Badge className="bg-purple-500/20 text-purple-300 border-purple-400/30">
                    Reviewer Role
                  </Badge>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Email: <span className="text-white font-bold">mentor@subnix.com</span>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Pass: <span className="text-white font-bold">mentor123</span>
                </div>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-400 uppercase">Super Admin</span>
                  <Badge className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                    Admin Role
                  </Badge>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Email: <span className="text-white font-bold">admin@gmail.com</span>
                </div>
                <div className="text-xs font-mono text-slate-300">
                  Pass: <span className="text-white font-bold">123456</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Link href="/auth/login">
                <Button className="bg-blue-500 hover:bg-blue-600 text-white gap-2">
                  Launch Demo Sign In (Quick-Fill)
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-slate-800">
                  Or register as a new Developer
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. DUAL WORKFLOW EXPLANATION */}
      <section className="py-16 sm:py-24 bg-slate-100/60 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Two Tailored Experiences in One Unified Platform
            </h2>
            <p className="text-slate-600 mt-3 text-base">
              Each user persona has dedicated views, defensive validation, and role-based permissions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Student Journey Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-6">
                  <Code2 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  1. Developer Submission Portal
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Designed for frictionless project handoffs while enforcing defensive code quality standards and preventing automated abuse.
                </p>

                <ul className="space-y-3.5 mb-8 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Zod-Powered Validation:</strong> Verifies Project Name, GitHub / GitLab repo format, live demo link, and detailed descriptions.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Duplicate Prevention:</strong> Prevents multiple pending reviews on identical repositories while allowing revision after rejection.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Spam Protection:</strong> Express Rate Limit enforces a 5-submission-per-hour limit per student.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Feedback History:</strong> Real-time status badges and mentor remarks visible in <em>My Submissions</em>.
                    </span>
                  </li>
                </ul>
              </div>

              <Link href="/submit">
                <Button className="w-full gap-2">
                  Submit a Project
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            {/* Mentor Journey Card */}
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-6">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">
                  2. Mentor Review Dashboard
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-6">
                  Equips instructors with an intuitive control tower to evaluate submissions, inspect code links, and provide structured feedback.
                </p>

                <ul className="space-y-3.5 mb-8 text-sm text-slate-700">
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Server-Side Filter Engine:</strong> Filter by <code>PENDING</code>, <code>APPROVED</code>, and <code>REJECTED</code> executed directly in PostgreSQL.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Paginated Data Table:</strong> Fast table with page, limit, and total count metadata for smooth navigation.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Mandatory Constructive Feedback:</strong> Mentors cannot reject without providing at least 10 characters explaining what to fix.
                    </span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Instant Cache Invalidation:</strong> Reviews trigger RTK Query tag updates, syncing tables and stats cards concurrently.
                    </span>
                  </li>
                </ul>
              </div>

              <Link href="/dashboard">
                <Button variant="outline" className="w-full gap-2 border-purple-300 text-purple-700 hover:bg-purple-50">
                  Open Mentor Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 6. ENTERPRISE ARCHITECTURE & RELIABILITY */}
      <section id="architecture" className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
            Enterprise Architecture
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Engineered for Reliability, Speed &amp; Integrity
          </h2>
          <p className="text-slate-600 mt-2 text-sm">
            Built with modern full-stack engineering standards designed to handle thousands of concurrent submissions with zero data anomalies.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">
              Role-Based Access Control (RBAC)
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Stateless JWT authentication paired with granular route guards. Enforces strict role checks between Developers, Mentors, and Administrators.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">
              Relational Data Integrity with Prisma
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Fully typed PostgreSQL schema modeling relations between developers, project submissions, and review audits with automated referential constraints.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">
              Defensive Form Validation
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Multi-layer Zod schemas validate Git repository URLs and project descriptions, catching malformed input before execution and surfacing feedback clearly.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">
              High-Performance Aggregations
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Concurrent PostgreSQL aggregations compute real-time platform metrics and approval rates with minimal database round-trip overhead.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">
              Anti-Duplicate Guard &amp; Rate Limits
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Composite database indexing and IP/User rate-limiting prevent duplicate submissions and automated spam while preserving resubmission capability.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 mb-1">
              Next.js 15 &amp; RTK Query Engine
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Combines optimized server-side rendering for data delivery with client-side Redux Toolkit Query cache invalidation for reactive review updates.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
