import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../utils/supabase";

/**
 * Retrieves the current user's ID from the Supabase session.
 *
 * @returns {Promise<string|null>} The user ID if a session exists, otherwise null.
 */
export const getOwnerId = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
};

/**
 * Base Redux Toolkit Query API slice.
 * Specific domain endpoints (Tasks, Projects, etc.) are injected into this base.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task", "Project", "Comment", "ProjectMember"],
  endpoints: () => ({}),
});