"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreateSubmissionMutation } from "@/redux/api/submissionApi";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { toast } from "react-toastify";
import { Send, CheckCircle2, AlertCircle, ExternalLink, Github } from "lucide-react";

export default function SubmitProjectPage() {
  const router = useRouter();
  const [createSubmission, { isLoading }] = useCreateSubmissionMutation();

  const [projectName, setProjectName] = useState("");
  const [repoUrl, setRepoUrl] = useState("");
  const [liveLink, setLiveLink] = useState("");
  const [description, setDescription] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setIsSuccess(false);

    // Client-side defensive checks
    if (!projectName.trim() || !repoUrl.trim() || !liveLink.trim() || !description.trim()) {
      setErrorMessage("Please fill out all required fields.");
      return;
    }

    if (!repoUrl.includes("github.com") && !repoUrl.includes("gitlab.com") && !repoUrl.includes("bitbucket.org")) {
      setErrorMessage("Repository URL must be a valid GitHub, GitLab, or Bitbucket link.");
      return;
    }

    try {
      const res: any = await createSubmission({
        projectName: projectName.trim(),
        repoUrl: repoUrl.trim(),
        liveLink: liveLink.trim(),
        description: description.trim(),
      }).unwrap();

      if (res.success) {
        setIsSuccess(true);
        toast.success("Project submitted successfully for mentor review!");
        // Reset form
        setProjectName("");
        setRepoUrl("");
        setLiveLink("");
        setDescription("");
      }
    } catch (err: any) {
      const message =
        err?.data?.message || err?.message || "Failed to submit project. Please try again.";
      setErrorMessage(message);
      toast.error(message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Submit Your Project
        </h1>
        <p className="text-slate-600 mt-2 text-base">
          Fill out your project repository and live deployment details. Your submission will be queued for mentor evaluation.
        </p>
      </div>

      {/* Success Notification Banner */}
      {isSuccess && (
        <div className="mb-8 p-5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-emerald-900">
              Submission Received!
            </h3>
            <p className="text-sm text-emerald-700 mt-1">
              Your project is now in the <strong>PENDING</strong> review queue. You can check your review status and mentor remarks anytime in your submissions history.
            </p>
            <div className="mt-3">
              <Link href="/my-submissions">
                <Button size="sm" variant="outline" className="border-emerald-300 text-emerald-800 bg-white hover:bg-emerald-100">
                  View My Submissions History
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Error Banner (e.g. Duplicate or Rate-Limit) */}
      {errorMessage && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-semibold text-rose-900 text-sm">Submission Error</h4>
            <p className="text-xs text-rose-700 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Main Submission Form */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            id="projectName"
            label="Project Name"
            placeholder="e.g., Full-Stack E-Commerce Dashboard"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            required
          />

          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-slate-700">
                GitHub Repository URL
              </label>
              <span className="text-xs text-slate-400">Must be public or accessible</span>
            </div>
            <div className="relative">
              <Input
                id="repoUrl"
                type="url"
                placeholder="https://github.com/username/project-repo"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                required
              />
            </div>
            <p className="text-xs text-slate-500">
              * Note: Duplicate submissions for the same repository are prevented while pending review.
            </p>
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Live Demo Link (Deployed URL)
            </label>
            <Input
              id="liveLink"
              type="url"
              placeholder="https://your-project.vercel.app"
              value={liveLink}
              onChange={(e) => setLiveLink(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="block text-sm font-medium text-slate-700">
              Project Description &amp; Technical Highlights
            </label>
            <Textarea
              id="description"
              placeholder="Explain the tech stack, features implemented, and any instructions for the reviewer (minimum 15 characters)..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              Rate limit: Maximum 5 submissions per hour.
            </div>
            <Button type="submit" isLoading={isLoading} className="gap-2">
              <Send className="w-4 h-4" />
              Submit for Review
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
