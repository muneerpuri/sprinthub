import { baseApi } from "./baseApi";
import { supabase } from "../../utils/supabase";

/**
 * Injects project member management endpoints into the base API.
 */
export const projectMembersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjectMembers: builder.query({
      queryFn: async (projectId) => {
        const { data, error } = await supabase
          .from("project_members")
          .select("id, role, userId, users(firstName, lastName, email)")
          .eq("projectId", projectId);
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, projectId) => [
        { type: "ProjectMember", id: projectId },
      ],
    }),
    inviteUserToProject: builder.mutation({
      queryFn: async ({ projectId, email, role }) => {
        const { data: user, error: userError } = await supabase
          .from("users")
          .select("id")
          .eq("email", email)
          .single();

        if (userError || !user) {
          return {
            error: { message: "User not found. They must sign up first." },
          };
        }

        const { data, error } = await supabase
          .from("project_members")
          .insert([{ projectId, userId: user.id, role }])
          .select();

        if (error) {
          if (error.code === "23505") {
            return {
              error: { message: "User is already a member of this project." },
            };
          }
          return { error };
        }
        return { data };
      },
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectMember", id: projectId },
      ],
    }),
    updateMemberRole: builder.mutation({
      queryFn: async ({ memberId, role, projectId }) => {
        const { data, error } = await supabase
          .from("project_members")
          .update({ role })
          .eq("id", memberId)
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectMember", id: projectId },
      ],
    }),
    removeMember: builder.mutation({
      queryFn: async ({ memberId, projectId }) => {
        const { error } = await supabase
          .from("project_members")
          .delete()
          .eq("id", memberId);
        if (error) return { error };
        return { data: memberId };
      },
      invalidatesTags: (result, error, { projectId }) => [
        { type: "ProjectMember", id: projectId },
      ],
    }),
  }),
});

export const {
  useGetProjectMembersQuery,
  useInviteUserToProjectMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} = projectMembersApi;
