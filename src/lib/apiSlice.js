import { baseApi } from "./api/baseApi";
import "./api/usersApi";
import "./api/tasksApi";
import "./api/projectsApi";
import "./api/projectMembersApi";
import "./api/commentsApi";
import "./api/workspacesApi";
import "./api/columnsApi";
import "./api/labelsApi";

export const apiSlice = baseApi;

export { useGetCurrentUserQuery, useUpdateUserProfileMutation, useSyncUserEmailMutation } from "./api/usersApi";
export { useGetTasksQuery, useAddTaskMutation, useUpdateTaskMutation, useDeleteTaskMutation } from "./api/tasksApi";
export { useGetProjectsQuery, useGetProjectsListQuery, useGetProjectByIdQuery, useAddProjectMutation, useUpdateProjectMutation, useDeleteProjectMutation } from "./api/projectsApi";
export { useGetProjectMembersQuery, useInviteUserToProjectMutation, useUpdateMemberRoleMutation, useRemoveMemberMutation } from "./api/projectMembersApi";
export { useGetCommentsQuery, useAddCommentMutation } from "./api/commentsApi";
export { useDeleteWorkspaceMutation,useGetWorkspacesQuery, useGetWorkspaceMembersQuery, useAddWorkspaceMutation } from "./api/workspacesApi";
export {  useGetColumnsQuery, useAddColumnMutation, useUpdateColumnMutation, useDeleteColumnMutation } from "./api/columnsApi";
export { useGetLabelsQuery, useAddLabelMutation } from "./api/labelsApi";