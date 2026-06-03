import { baseApi } from "./api/baseApi";

// Importing these files forces the injectEndpoints calls to run
import "./api/usersApi";
import "./api/tasksApi";
import "./api/projectsApi";
import "./api/projectMembersApi";
import "./api/commentsApi";

export const apiSlice = baseApi;

// Re-export hooks for component usage
export { useGetCurrentUserQuery } from "./api/usersApi";
export {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from "./api/tasksApi";
export {
  useGetProjectsQuery,
  useGetProjectByIdQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
} from "./api/projectsApi";
export {
  useGetProjectMembersQuery,
  useInviteUserToProjectMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation,
} from "./api/projectMembersApi";
export { useGetCommentsQuery, useAddCommentMutation } from "./api/commentsApi";
