import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../utils/supabase";

/**
 * Retrieves the current user's ID from the Supabase session.
 * @returns {Promise<string|null>} The user ID if a session exists, otherwise null.
 */
const getOwnerId = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
};

/**
 * A Redux Toolkit Query API slice for interacting with the Supabase backend.
 * It defines endpoints for tasks, projects, project members, and comments.
 */
export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task", "Project", "Comment", "ProjectMember"],
  endpoints: (builder) => ({
    // CURRENT USER
    getCurrentUser: builder.query({
      queryFn: async () => {
        const id = await getOwnerId();
        return { data: id };
      },
    }),

    // TASKS (Unchanged)
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

    // PROJECTS
    getProjects: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("projects")
          .select("*, owner:ownerId(firstName, lastName, email)")
          .order("createdAt", { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ["Project"],
    }),
    getProjectById: builder.query({
      queryFn: async (id) => {
        const { data, error } = await supabase
          .from("projects")
          .select("*, owner:ownerId(firstName, lastName, email)")
          .eq("id", id)
          .single();
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, id) => [{ type: "Project", id }],
    }),
    addProject: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase
          .from("projects")
          .insert([{ ...payload, ownerId }])
          .select();
        if (error) return { error };

        if (data && data.length > 0) {
          const newProject = data[0];
          const { error: memberError } = await supabase
            .from("project_members")
            .insert([
              {
                projectId: newProject.id,
                userId: ownerId,
                role: "owner",
              },
            ]);
          if (memberError) {
            console.error("Failed to add owner member record:", memberError);
          }
        }
        return { data };
      },
      invalidatesTags: ["Project"],
    }),
    updateProject: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase
          .from("projects")
          .update(payload)
          .eq("id", id)
          .select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ["Project", "Task"],
    }),
    deleteProject: builder.mutation({
      queryFn: async (id) => {
        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: ["Project", "Task"],
    }),

    // PROJECT MEMBERS (NEW)
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
        // 1. Find user by email
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

        // 2. Add to project_members
        const { data, error } = await supabase
          .from("project_members")
          .insert([
            {
              projectId,
              userId: user.id,
              role,
            },
          ])
          .select();

        if (error) {
          if (error.code === "23505")
            return {
              error: { message: "User is already a member of this project." },
            };
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

    // COMMENTS (Unchanged)
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
      providesTags: (result, error, taskId) => [
        { type: "Comment", id: taskId },
      ],
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
      invalidatesTags: (result, error, { taskId }) => [
        { type: "Comment", id: taskId },
      ],
    }),
  }),
});

export const {
  useGetCurrentUserQuery,
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetProjectMembersQuery,
  useInviteUserToProjectMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
} = apiSlice;
