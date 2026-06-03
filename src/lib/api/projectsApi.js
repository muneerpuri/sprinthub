import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

/**
 * Injects project-related endpoints into the base API.
 */
export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
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
            .insert([{ projectId: newProject.id, userId: ownerId, role: "owner" }]);
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
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;