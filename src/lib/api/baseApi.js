import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { supabase } from "../../utils/supabase";

/**
 * Retrieves the current user's ID from the Supabase session.
 */
export const getOwnerId = async () => {
  const { data } = await supabase.auth.getSession();
  return data?.session?.user?.id || null;
};

/**
 * Base Redux Toolkit Query API slice.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Task", "Project", "Comment", "ProjectMember", "User", "Workspace", "WorkspaceMember", "Label", "Column"],
  endpoints: () => ({}),
});