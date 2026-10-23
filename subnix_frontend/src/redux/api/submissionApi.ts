import { baseApi } from "./baseApi";

export const submissionApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Student creates submission
    createSubmission: builder.mutation({
      query: (data) => ({
        url: "/submissions",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["submission", "stats"],
    }),

    // Student gets their own submissions
    getMySubmissions: builder.query({
      query: () => ({
        url: "/submissions/my-submissions",
        method: "GET",
      }),
      providesTags: ["submission"],
    }),

    // Mentor/Admin gets paginated submissions with server-side filters
    getAllSubmissions: builder.query({
      query: (params) => ({
        url: "/submissions",
        method: "GET",
        params,
      }),
      providesTags: ["submission"],
    }),

    // Get single submission
    getSingleSubmission: builder.query({
      query: (id: string) => ({
        url: `/submissions/${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: "submission", id }],
    }),

    // Mentor approves or rejects a submission
    reviewSubmission: builder.mutation({
      query: ({ id, data }: { id: string; data: { status: "APPROVED" | "REJECTED"; feedback?: string } }) => ({
        url: `/submissions/${id}/review`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["submission", "stats"],
    }),

    // Mentor dashboard aggregated statistics
    getSubmissionStats: builder.query({
      query: () => ({
        url: "/submissions/stats",
        method: "GET",
      }),
      providesTags: ["stats"],
    }),
  }),
});

export const {
  useCreateSubmissionMutation,
  useGetMySubmissionsQuery,
  useGetAllSubmissionsQuery,
  useGetSingleSubmissionQuery,
  useReviewSubmissionMutation,
  useGetSubmissionStatsQuery,
} = submissionApi;
