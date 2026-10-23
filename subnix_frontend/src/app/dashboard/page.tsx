"use client";

import React, { useState } from "react";
import {
  useGetAllSubmissionsQuery,
  useGetSubmissionStatsQuery,
  useReviewSubmissionMutation,
} from "@/redux/api/submissionApi";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Modal } from "@/components/ui/Modal";
import { toast } from "react-toastify";
import {
  Search,
  CheckCircle,
  XCircle,
  Clock,
  Layers,
  TrendingUp,
  Github,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function MentorDashboardPage() {
  // Query state for server-side pagination & filtering
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [activeSearch, setActiveSearch] = useState("");

  // Review Modal state
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<"APPROVED" | "REJECTED">("APPROVED");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // RTK Query hooks
  const { data: statsData, isLoading: isStatsLoading } = useGetSubmissionStatsQuery(undefined);
  const {
    data: submissionsData,
    isLoading: isTableLoading,
    isFetching: isTableFetching,
  } = useGetAllSubmissionsQuery({
    page,
    limit,
    status: statusFilter,
    search: activeSearch || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [reviewSubmission, { isLoading: isSubmittingReview }] = useReviewSubmissionMutation();

  const stats = statsData?.data;
  const submissions = submissionsData?.data || [];
  const meta = submissionsData?.meta || { page: 1, limit: 10, total: 0, totalPages: 1 };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setActiveSearch(searchInput.trim());
  };

  const handleStatusChange = (newStatus: string) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleOpenReviewModal = (submission: any) => {
    setSelectedSubmission(submission);
    setReviewStatus("APPROVED");
    setReviewFeedback("");
    setIsModalOpen(true);
  };

  const handleCloseReviewModal = () => {
    setIsModalOpen(false);
    setSelectedSubmission(null);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();

    if (reviewStatus === "REJECTED" && (!reviewFeedback.trim() || reviewFeedback.trim().length < 10)) {
      toast.error("Constructive feedback (at least 10 characters) is required when rejecting a project.");
      return;
    }

    try {
      const res: any = await reviewSubmission({
        id: selectedSubmission.id,
        data: {
          status: reviewStatus,
          feedback: reviewFeedback.trim() || undefined,
        },
      }).unwrap();

      if (res.success) {
        toast.success(`Submission updated to ${reviewStatus}!`);
        handleCloseReviewModal();
      }
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Failed to update review status.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Dashboard Title */}
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Mentor Review Dashboard
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Evaluate submitted projects, filter by review statuses, and track platform metrics.
        </p>
      </div>

      {/* Aggregated Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Total Submissions */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">
            {isStatsLoading ? "..." : stats?.totalSubmissions ?? 0}
          </div>
          <span className="text-xs text-slate-400 mt-1 block">All projects submitted</span>
        </div>

        {/* Pending */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/30">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-amber-700">
            {isStatsLoading ? "..." : stats?.totalPending ?? 0}
          </div>
          <span className="text-xs text-amber-600/80 mt-1 block">Awaiting mentor review</span>
        </div>

        {/* Approved */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-gradient-to-br from-white to-emerald-50/30">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Approved</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">
            {isStatsLoading ? "..." : stats?.totalApproved ?? 0}
          </div>
          <span className="text-xs text-emerald-600/80 mt-1 block">Successfully passed</span>
        </div>

        {/* Rejected */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-sm bg-gradient-to-br from-white to-rose-50/30">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-700">
            {isStatsLoading ? "..." : stats?.totalRejected ?? 0}
          </div>
          <span className="text-xs text-rose-600/80 mt-1 block">Needs revision</span>
        </div>

        {/* Approval Rate */}
        <div className="bg-white p-5 rounded-2xl border border-blue-200 shadow-sm col-span-2 md:col-span-1 bg-gradient-to-br from-white to-blue-50/30">
          <div className="flex items-center justify-between text-blue-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-700">
            {isStatsLoading ? "..." : `${stats?.approvalRatePercentage ?? 0}%`}
          </div>
          <span className="text-xs text-blue-600/80 mt-1 block">Overall approval ratio</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          {["ALL", "PENDING", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => handleStatusChange(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                statusFilter === st
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st === "ALL" ? "All Submissions" : st}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by project, student, keyword..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button type="submit" size="sm" variant="secondary" className="shrink-0">
            Search
          </Button>
          {activeSearch && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => {
                setSearchInput("");
                setActiveSearch("");
                setPage(1);
              }}
            >
              Clear
            </Button>
          )}
        </form>
      </div>

      {/* Paginated Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Project Details</th>
                <th className="px-6 py-4">Student</th>
                <th className="px-6 py-4">Links</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Submitted At</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isTableLoading || isTableFetching ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    <div className="inline-flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Loading submissions from server...
                    </div>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                    No submissions found matching the selected filter.
                  </td>
                </tr>
              ) : (
                submissions.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Project */}
                    <td className="px-6 py-4 max-w-xs">
                      <div className="font-semibold text-slate-900 truncate">
                        {sub.projectName}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                        {sub.description}
                      </p>
                    </td>

                    {/* Student */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-slate-900">
                        {sub.student?.fullName || "Student"}
                      </div>
                      <div className="text-xs text-slate-400">{sub.student?.email}</div>
                    </td>

                    {/* Links */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a
                          href={sub.repoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          title="Open GitHub Repository"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                        <a
                          href={sub.liveLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Open Live Deployment"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge status={sub.status}>{sub.status}</Badge>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-500">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>

                    {/* Action */}
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <Button
                        size="sm"
                        variant={sub.status === "PENDING" ? "primary" : "outline"}
                        onClick={() => handleOpenReviewModal(sub)}
                      >
                        {sub.status === "PENDING" ? "Review" : "Update Review"}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Server-Side Pagination Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-500">
            Showing Page <strong>{meta.page}</strong> of <strong>{meta.totalPages || 1}</strong> ({meta.total} total submissions)
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={meta.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={meta.page >= meta.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="gap-1"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Review Modal */}
      {selectedSubmission && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseReviewModal}
          title={`Review: ${selectedSubmission.projectName}`}
        >
          <form onSubmit={handleSubmitReview} className="space-y-5">
            <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
              <div>
                <strong>Student:</strong> {selectedSubmission.student?.fullName} ({selectedSubmission.student?.email})
              </div>
              <div className="flex items-center gap-3 pt-1">
                <a
                  href={selectedSubmission.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Github className="w-3.5 h-3.5" /> Repository
                </a>
                <a
                  href={selectedSubmission.liveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Live Demo
                </a>
              </div>
            </div>

            {/* Approval / Rejection Toggle Buttons */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Evaluation Decision
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setReviewStatus("APPROVED")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    reviewStatus === "APPROVED"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-800 ring-2 ring-emerald-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Approve Project
                </button>
                <button
                  type="button"
                  onClick={() => setReviewStatus("REJECTED")}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-semibold transition-all ${
                    reviewStatus === "REJECTED"
                      ? "bg-rose-50 border-rose-500 text-rose-800 ring-2 ring-rose-500/20"
                      : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <XCircle className="w-4 h-4 text-rose-600" />
                  Reject Project
                </button>
              </div>
            </div>

            {/* Mentor Feedback Textarea */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-slate-700">
                  Feedback &amp; Remarks
                </label>
                {reviewStatus === "REJECTED" && (
                  <span className="text-xs text-rose-600 font-medium">
                    Required (min 10 chars)
                  </span>
                )}
              </div>
              <Textarea
                rows={4}
                placeholder={
                  reviewStatus === "APPROVED"
                    ? "Great code structure, clean modularity... (optional)"
                    : "Explain specifically what needs to be fixed before resubmitting (e.g., broken live link, missing types)..."
                }
                value={reviewFeedback}
                onChange={(e) => setReviewFeedback(e.target.value)}
                required={reviewStatus === "REJECTED"}
              />
            </div>

            {/* Submit Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="ghost"
                onClick={handleCloseReviewModal}
                disabled={isSubmittingReview}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                isLoading={isSubmittingReview}
                variant={reviewStatus === "APPROVED" ? "primary" : "danger"}
              >
                Confirm {reviewStatus === "APPROVED" ? "Approval" : "Rejection"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
