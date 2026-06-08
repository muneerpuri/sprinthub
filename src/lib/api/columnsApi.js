import { baseApi } from "./baseApi";
import { supabase } from "../../utils/supabase";

export const columnsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getColumns: builder.query({
      queryFn: async (projectId) => {
        const { data, error } = await supabase
          .from("board_columns")
          .select("*")
          .eq("projectId", projectId)
          .is("deletedAt", null)
          .order("order", { ascending: true });
          
        if (error) return { error };
        return { data };
      },
      providesTags: ["Column"],
    }),

    addColumn: builder.mutation({
      queryFn: async (payload) => {
        const { data, error } = await supabase
          .from("board_columns")
          .insert([payload])
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Column"],
    }),

    deleteColumn: builder.mutation({
      queryFn: async (id) => {
        const { count: activeTasks, error: countError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("columnId", id)
          .is("deletedAt", null);

        if (countError) return { error: countError };
        if (activeTasks && activeTasks > 0) {
          return { error: { message: `Cannot delete column with ${activeTasks} active task(s). Move the tasks to another column first.` } };
        }

        const { data, error } = await supabase
          .from("board_columns")
          .update({ deletedAt: new Date().toISOString() })
          .eq("id", id)
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Column"],
    }),
    updateColumn: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase
          .from("board_columns")
          .update(payload)
          .eq("id", id)
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Column"],
    }),
  }),
});

export const { useGetColumnsQuery, useAddColumnMutation, useUpdateColumnMutation, useDeleteColumnMutation } = columnsApi;