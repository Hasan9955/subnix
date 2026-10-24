"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Code2,
  Github,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Globe,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

export const Footer: React.FC = () => {
  const [emailInput, setEmailInput] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setIsSubscribed(true);
    toast.success("Thank you for subscribing to Subnix Engineering updates!");
    setEmailInput("");
  };

  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Mission Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-slate-900 group">
              <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm group-hover:bg-blue-700 transition-colors">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-black tracking-tight">Subnix</span>
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
              The modern code evaluation and project handoff platform. Empowering developer bootcamps, university cohorts, and engineering organizations with structured mentor reviews and transparent progress metrics.
            </p>

            {/* Newsletter */}
            <div className="pt-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 block mb-2">
                Subscribe to Engineering Updates
              </span>
              <form onSubmit={handleSubscribe} className="flex max-w-sm gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="engineer@company.com"
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  Join
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
              {isSubscribed && (
                <span className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-1.5">
                  <CheckCircle2 className="w-3 h-3" /> You are subscribed to product updates.
                </span>
              )}
            </div>
          </div>

          {/* Column 1: Platform */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/submit" className="hover:text-blue-600 transition-colors">
                  Developer Submission Portal
                </Link>
              </li>
              <li>
                <Link href="/my-submissions" className="hover:text-blue-600 transition-colors">
                  Submission History &amp; Audits
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-blue-600 transition-colors">
                  Mentor Review Queue
                </Link>
              </li>
              <li>
                <a href="#metrics" className="hover:text-blue-600 transition-colors">
                  Live Analytics Dashboard
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-blue-600 transition-colors">
                  Anti-Duplicate Guard Engine
                </a>
              </li>
              <li>
                <span className="inline-flex items-center gap-1.5 text-slate-400">
                  Automated Linters <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">v2.5</span>
                </span>
              </li>
            </ul>
          </div>

          {/* Column 2: Solutions */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Solutions
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Coding Bootcamps &amp; Academies
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  University Computer Science Cohorts
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Enterprise Mentorship Programs
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Open Source Handoff Audits
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Hackathon Evaluation Workflows
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Team Code Review Standardization
                </span>
              </li>
            </ul>
          </div>

          {/* Column 3: Resources & Company */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">
              Resources &amp; Trust
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/auth/login" className="hover:text-blue-600 transition-colors">
                  Demo Sandbox Access
                </Link>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors flex items-center gap-1">
                  API Documentation <ExternalLink className="w-3 h-3 text-slate-400" />
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Security Architecture &amp; RBAC
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  PostgreSQL Index Optimization
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-blue-600 cursor-pointer transition-colors">
                  Privacy Policy &amp; GDPR
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Live Operational Health Bar */}
        <div className="mt-12 pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              All Systems Operational (99.98% Uptime)
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1">
              <Globe className="w-3.5 h-3.5 text-slate-400" /> Region: US-East (AWS Neon Cluster)
            </span>
          </div>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-slate-400">
            <a
              href="https://github.com/Hasan9955/subnix"
              target="_blank"
              rel="noreferrer"
              className="hover:text-slate-700 transition-colors"
              aria-label="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>
            <span className="hover:text-slate-700 cursor-pointer transition-colors" aria-label="Twitter">
              <Twitter className="w-4 h-4" />
            </span>
            <span className="hover:text-slate-700 cursor-pointer transition-colors" aria-label="LinkedIn">
              <Linkedin className="w-4 h-4" />
            </span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-6 text-center sm:text-left text-xs text-slate-400 flex flex-col sm:flex-row justify-between items-center gap-2">
          <p>© {new Date().getFullYear()} Subnix Technologies Inc. All rights reserved.</p>
          <p className="flex items-center gap-1.5 text-[11px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> End-to-end JWT authentication &amp; role-based encryption
          </p>
        </div>
      </div>
    </footer>
  );
};
