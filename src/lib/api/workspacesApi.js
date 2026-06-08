import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

export const workspacesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWorkspaces: builder.query({
      queryFn: async () => {
        const userId = await getOwnerId();
        const { data, error } = await supabase
          .from("workspace_members")
          .select("workspaceId, role, workspaces(*)")
          .eq("userId", userId)
          .is("workspaces.deletedAt", null);
        if (error) return { error };
        return { data: data.map((d) => ({ ...d.workspaces, role: d.role })) };
      },
      providesTags: ["Workspace"],
    }),
    getWorkspaceMembers: builder.query({
      queryFn: async (workspaceId) => {
        const { data, error } = await supabase
          .from("workspace_members")
          .select("id, userId, role, users(firstName, lastName, email)")
          .eq("workspaceId", workspaceId);
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, workspaceId) => [{ type: "WorkspaceMember", id: workspaceId }],
    }),
    // Add this right below addWorkspace
    deleteWorkspace: builder.mutation({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from("workspaces")
          .update({ deletedAt: new Date().toISOString() })
          .eq("id", id)
          .select();
        
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Workspace"], // Refreshes the UI instantly
    }),
    // ADDED: Create Workspace Mutation
    addWorkspace: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase
          .from("workspaces")
          .insert([{ ...payload, ownerId }])
          .select();
        
        if (error) return { error };

        // Automatically assign the creator as the 'owner' of the new workspace
        if (data && data.length > 0) {
          await supabase.from("workspace_members").insert([
            { workspaceId: data[0].id, userId: ownerId, role: "owner" },
          ]);
        }
        return { data };
      },
      invalidatesTags: ["Workspace"],
    }),
  }),
});

export const { useDeleteWorkspaceMutation,useGetWorkspacesQuery, useGetWorkspaceMembersQuery, useAddWorkspaceMutation } = workspacesApi;