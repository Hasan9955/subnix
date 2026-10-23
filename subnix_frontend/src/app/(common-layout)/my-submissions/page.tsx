"use client";

import React from "react";
import Link from "next/link";
import { useGetMySubmissionsQuery } from "@/redux/api/submissionApi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ExternalLink, Github, MessageSquare, Clock, PlusCircle } from "lucide-react";

export default function MySubmissionsPage() {
  const { data, isLoading, isError, refetch } = useGetMySubmissionsQuery(undefined);

  const submissions = data?.data || [];

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Project Submissions
          </h1>
          <p className="text-slate-600 mt-1 text-sm">
            Track the status of your submitted projects and view feedback from mentors.
          </p>
        </div>
        <Link href="/submit">
          <Button className="gap-2 shrink-0">
            <PlusCircle className="w-4 h-4" />
            New Submission
          </Button>
        </Link>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-36 bg-white rounded-xl border border-slate-200 animate-pulse p-6"
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && submissions.length === 0 && (
        <div className="text-center bg-white rounded-2xl border border-slate-200 p-12 max-w-lg mx-auto shadow-sm">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Clock className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">
            No submissions yet
          </h3>
          <p className="text-sm text-slate-500 mt-1 mb-6">
            You haven&apos;t submitted any projects for evaluation. Submit your first project to get reviewed!
          </p>
          <Link href="/submit">
            <Button>Submit Your First Project</Button>
          </Link>
        </div>
      )}

      {/* Submissions List */}
      {!isLoading && submissions.length > 0 && (
        <div className="space-y-6">
          {submissions.map((sub: any) => {
            const latestReview = sub.reviews?.[0];

            return (
              <div
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 hover:border-slate-300 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        {sub.projectName}
                      </h2>
                      <Badge status={sub.status}>{sub.status}</Badge>
                    </div>
                    <span className="text-xs text-slate-400 mt-1 block">
                      Submitted on {new Date(sub.createdAt).toLocaleDateString()} at{" "}
                      {new Date(sub.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  {/* External Links */}
                  <div className="flex items-center gap-2">
                    <a
                      href={sub.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Github className="w-3.5 h-3.5" />
                      Repository
                    </a>
                    <a
                      href={sub.liveLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Live Demo
                    </a>
                  </div>
                </div>

                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  {sub.description}
                </p>

                {/* Mentor Feedback Section if reviewed */}
                {latestReview && (
                  <div
                    className={`mt-4 p-4 rounded-xl border text-sm ${
                      sub.status === "APPROVED"
                        ? "bg-emerald-50/70 border-emerald-200 text-emerald-900"
                        : "bg-rose-50/70 border-rose-200 text-rose-900"
                    }`}
                  >
                    <div className="flex items-center gap-2 font-semibold mb-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>Mentor Feedback:</span>
                      <span className="text-xs font-normal opacity-75">
                        (by {latestReview.reviewer?.fullName || "Mentor"})
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed mt-1">
                      {latestReview.feedback || "No additional remarks provided."}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
