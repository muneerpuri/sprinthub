// src/lib/apiSlice.js
import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react';
import { supabase } from '../utils/supabase';

const getOwnerId = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Task', 'Project', 'Comment'],
  endpoints: (builder) => ({
    // TASKS
    getTasks: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .is('deletedAt', null) // Filter out soft-deleted tasks
          .order('createdAt', { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ['Task'],
    }),
    addTask: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase.from('tasks').insert([{ ...payload, ownerId }]).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Task'],
    }),
    updateTask: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase.from('tasks').update(payload).eq('id', id).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation({
      queryFn: async (id) => {
        const { error } = await supabase
          .from('tasks')
          .update({ deletedAt: new Date().toISOString() }) // Soft-delete task
          .eq('id', id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: ['Task'],
    }),

    // PROJECTS
    getProjects: builder.query({
      queryFn: async () => {
        const { data, error } = await supabase.from('projects').select('*').order('createdAt', { ascending: false });
        if (error) return { error };
        return { data };
      },
      providesTags: ['Project'],
    }),
    addProject: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase.from('projects').insert([{ ...payload, ownerId }]).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Project'],
    }),
    updateProject: builder.mutation({
      queryFn: async ({ id, ...payload }) => {
        const { data, error } = await supabase.from('projects').update(payload).eq('id', id).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: ['Project', 'Task'],
    }),
    deleteProject: builder.mutation({
      queryFn: async (id) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) return { error };
        return { data: id };
      },
      invalidatesTags: ['Project', 'Task'],
    }),

    // COMMENTS
    getComments: builder.query({
      queryFn: async (taskId) => {
        const { data, error } = await supabase.from('comments').select('*').eq('taskId', taskId).order('createdAt', { ascending: true });
        if (error) return { error };
        return { data };
      },
      providesTags: (result, error, taskId) => [{ type: 'Comment', id: taskId }],
    }),
    addComment: builder.mutation({
      queryFn: async (payload) => {
        const ownerId = await getOwnerId();
        const { data, error } = await supabase.from('comments').insert([{ ...payload, ownerId }]).select();
        if (error) return { error };
        return { data };
      },
      invalidatesTags: (result, error, { taskId }) => [{ type: 'Comment', id: taskId }],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useAddTaskMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
  useGetProjectsQuery,
  useAddProjectMutation,
  useUpdateProjectMutation,
  useDeleteProjectMutation,
  useGetCommentsQuery,
  useAddCommentMutation,
} = apiSlice;