// src/lib/api/columnsApi.js
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
          .order("order", { ascending: true }); // Make sure they load in order!
          
        if (error) return { error };
        return { data };
      },
      providesTags: ["Column"],
    }),

    // 🔥 ADD THIS: Create a new column
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

    // 🔥 ADD THIS: Update column (for reordering or renaming)
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

export const { useGetColumnsQuery, useAddColumnMutation, useUpdateColumnMutation } = columnsApi;