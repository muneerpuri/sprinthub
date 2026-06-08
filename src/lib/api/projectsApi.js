import { baseApi, getOwnerId } from "./baseApi";
import { supabase } from "../../utils/supabase";

/**
 * Injects project-related endpoints into the base API.
 */
export const projectsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query({
      queryFn: async ({ page = 1, limit = 9, search = "" } = {}) => {
        try {
          const from = (page - 1) * limit;
          const to = from + limit - 1;

          let query = supabase
            .from("projects")
            .select("*, owner:ownerId(firstName, lastName, email)", { count: "exact" })
            .order("createdAt", { ascending: false })
            .range(from, to);

          if (search) {
            query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
          }

          const { data, count, error } = await query;
          if (error) throw error;

          return {
            data: {
              projects: data,
              totalCount: count || 0,
              totalPages: count ? Math.ceil(count / limit) : 0
            }
          };
        } catch (error) {
          return { error };
        }
      },
      providesTags: ["Project"],
    }),

    /** Lightweight list of all projects (id + name only) for dropdown usage. */
    getProjectsList: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase
          .from("projects")
          .select("id, name")
          .order("name", { ascending: true });
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
              { projectId: newProject.id, userId: ownerId, role: "owner" },
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
        const { count: activeTasks, error: countError } = await supabase
          .from("tasks")
          .select("*", { count: "exact", head: true })
          .eq("projectId", id)
          .is("deletedAt", null);

        if (countError) return { error: countError };
        if (activeTasks && activeTasks > 0) {
          return { error: { message: `Cannot delete project with ${activeTasks} active task(s). Delete or reassign the tasks first.` } };
        }

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
  useGetProjectsListQuery,
  useGetProjectByIdQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} = projectsApi;
