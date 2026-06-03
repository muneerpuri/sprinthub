import { baseApi, getOwnerId } from "./baseApi";

/**
 * Injects user-related endpoints into the base API.
 */
export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query({
      queryFn: async () => {
        const id = await getOwnerId();
        return { data: id };
      },
    }),
  }),
});

export const { useGetCurrentUserQuery } = usersApi;
