import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
getTasks: builder.query({
      queryFn: async (projectId) => {
        let query = supabase
          .from("tasks")
          .select("*, assignee:users!assigneeId(firstName, lastName, email)")
          .is("deletedAt", null)
          .order("createdAt", { ascending: false });
          
        if (projectId) query = query.eq("projectId", projectId);
        
        const { data, error } = await query;
        if (error) return { error };
        return { data };
      },
      providesTags: ["Task"],
    }),
    addTask: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase.from("tasks").insert([{ ...payload, ownerId }]).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Task"],
    }),
    updateTask: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase.from("tasks").update(payload).eq("id", id).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Task"],
    }),
    deleteTask: builder.mutation({
      queryFn: async (id) => {
        const { error } = await supabase.from("tasks").update({ deletedAt: new Date().toISOString() }).eq("id", id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: ["Task"],
    }),
  }),
});

export const { useGetTasksQuery, useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } = tasksApi;