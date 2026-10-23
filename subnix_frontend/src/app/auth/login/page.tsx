"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLoginMutation } from "@/redux/api/authApi";
import { useAppDispatch } from "@/redux/hooks";
import { setUser } from "@/redux/slices/authSlice";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { toast } from "react-toastify";
import { Lock, Mail, UserCheck, Shield } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please provide both email and password.");
      return;
    }

    try {
      const res: any = await login({ email, password }).unwrap();
      if (res.success && res.data) {
        dispatch(
          setUser({
            user: res.data.user,
            token: res.data.accessToken,
          })
        );

        toast.success(`Welcome back, ${res.data.user.fullName}!`);

        if (res.data.user.role === "MENTOR" || res.data.user.role === "ADMIN") {
          router.push("/dashboard");
        } else {
          router.push("/submit");
        }
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Invalid credentials. Please try again.";
      setErrorMsg(message);
      toast.error(message);
    }
  };

  const handleFillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sign in to Subnix
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Access your student portal or mentor review dashboard
          </p>
        </div>

        {/* Demo Fast-Login Helpers */}
        <div className="mb-6 p-3 bg-slate-50 border border-slate-200 rounded-xl">
          <span className="text-xs font-semibold text-slate-600 block mb-2">
            ⚡ Quick-fill Seeded Accounts:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleFillCredentials("mentor@subnix.com", "mentor123")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-purple-300 hover:text-purple-700 transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5 text-purple-600" />
              Lead Mentor
            </button>
            <button
              type="button"
              onClick={() => handleFillCredentials("admin@gmail.com", "123456")}
              className="flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:border-blue-300 hover:text-blue-700 transition-colors"
            >
              <Shield className="w-3.5 h-3.5 text-blue-600" />
              Super Admin
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-600 font-medium">
              {errorMsg}
            </div>
          )}

          <Button type="submit" isLoading={isLoading} className="w-full">
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="text-center mt-6 pt-6 border-t border-slate-100">
          <p className="text-sm text-slate-600">
            Don&apos;t have an account yet?{" "}
            <Link
              href="/auth/signup"
              className="font-semibold text-blue-600 hover:text-blue-700"
            >
              Sign up as a Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
