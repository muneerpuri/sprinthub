import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      queryFn: async () => {
        try {
          const id = await getOwnerId();

          const { data: user, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

          if (error && error.code !== "PGRST116") {
            return { error };
          }

          return {
            data: user || { id },
          };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["User"],
    }),

    updateUserProfile: builder.mutation({
      queryFn: async ({
        id,
        firstName,
        lastName,
        email,
        password,
      }) => {
        try {
          // Update Supabase Auth (email/password)
          const authUpdates = {};

          if (email) authUpdates.email = email;
          if (password) authUpdates.password = password;

          if (Object.keys(authUpdates).length > 0) {
            const { error: authError } =
              await supabase.auth.updateUser(authUpdates);

            if (authError) {
              return { error: authError };
            }
          }

          // Update users table
          const dbUpdates = {
            updatedAt: new Date().toISOString(),
          };

          if (firstName !== undefined)
            dbUpdates.firstName = firstName;

          if (lastName !== undefined)
            dbUpdates.lastName = lastName;

          const { data, error } = await supabase
            .from("users")
            .update(dbUpdates)
            .eq("id", id)
            .select()
            .single();

          if (error) {
            return { error };
          }

          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["User"],
    }),

    // Sync verified auth email to users table
    syncUserEmail: builder.mutation({
      queryFn: async ({ id }) => {
        try {
          const {
            data: { session },
            error: sessionError,
          } = await supabase.auth.getSession();

          if (sessionError) {
            return { error: sessionError };
          }

          const authEmail = session?.user?.email;

          if (!authEmail) {
            return {
              error: {
                message: "No authenticated session found",
              },
            };
          }

          const { data, error } = await supabase
            .from("users")
            .update({
              email: authEmail,
              updatedAt: new Date().toISOString(),
            })
            .eq("id", id)
            .select()
            .single();

          if (error) {
            return { error };
          }

          return { data };
        } catch (error) {
          return { error };
        }
      },
      invalidatesTags: ["User"],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useUpdateUserProfileMutation,
  useSyncUserEmailMutation,
} = usersApi;