import { baseApi } from "./baseApi";
import { supabase } from "../../utils/supabase";

export const labelsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getLabels: builder.query({
      queryFn: async (workspaceId) => {
        const { data, error } = await supabase.from("labels").select("*").eq("workspaceId", workspaceId).is("deletedAt", null);
        if (error) return { error };
        return { data };
      },
      providesTags: ["Label"],
    }),
    addLabel: builder.mutation({
      queryFn: async (payload) => {
        const { data, error } = await supabase.from("labels").insert([payload]).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Label"],
    }),
  }),
});

export const { useGetLabelsQuery, useAddLabelMutation } = labelsApi;