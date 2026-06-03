import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

/**
 * Injects comments-related endpoints into the base API.
 */
export const commentsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getComments: builder.query({
      queryFn: async (taskId) => {
        const { data, error } = await supabase
          .from("comments")
          .select("*, owner:ownerId (firstName, lastName, email)")
          .eq("taskId", taskId)
          .order("createdAt", { ascending: true });
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, taskId) => [{ type: "Comment", id: taskId }],
    }),
    addComment: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase
          .from("comments")
          .insert([{ ...payload, ownerId }])
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { taskId }) => [{ type: "Comment", id: taskId }],
    }),
  }),
});

export const { useGetCommentsQuery, useAddCommentMutation } = commentsApi;