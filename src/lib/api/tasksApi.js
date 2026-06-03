import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

/**
 * Injects task-related endpoints into the base API.
 */
export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("tasks")
          .select("*")
          .is("deletedAt", null)
          .order("createdAt", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Task"],
    }),
    addTask: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase
          .from("tasks")
          .insert([{ ...payload, ownerId }])
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase
          .from("tasks")
          .update(payload)
          .eq("id", id)
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation({
      queryFn: async (id) => {
        const { error } = await supabase
          .from("tasks")
          .update({ deletedAt: new Date().toISOString() })
          .eq("id", id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: ["Task"],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
