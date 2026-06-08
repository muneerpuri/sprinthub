import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      queryFn: async () => {
        const id = await getOwnerId();
        const { data: user } = await supabase.from("users").select("*").eq("id", id).single();
        return { data: user || { id } };
      },
      providesTags: ["User"],
    }),
    updateUserProfile: builder.mutation({
      queryFn: async ({ id, firstName, lastName, email, password }) => {
        // 1. Update Auth Provider (Supabase Auth)
        const updates = {};
        if (email) updates.email = email;
        if (password) updates.password = password;
        
        if (Object.keys(updates).length > 0) {
          const { error: authError } = await supabase.auth.updateUser(updates);
          if (authError) return { error: authError };
        }

        // 2. Update DB users table
        const { data, error } = await supabase
          .from("users")
          .update({ firstName, lastName, email, updatedAt: new Date().toISOString() })
          .eq("id", id)
          .select();
          
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const { useGetCurrentUserQuery, useUpdateUserProfileMutation } = usersApi;