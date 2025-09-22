import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Base URL for the API - use direct server URL
const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

console.log('🔗 API Base URL:', baseUrl);

export const api = createApi({
    baseQuery: fetchBaseQuery({
        baseUrl,
        credentials: 'include',
        prepareHeaders: (headers, { getState }) => {
            // Get token from auth state
            const token = (getState() as any).auth?.token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            headers.set('content-type', 'application/json');
            return headers;
        },
    }),
    reducerPath: "api",
    tagTypes: ['Auth', 'Product', 'Category', 'Supplier', 'Purchase', 'Inventory'],
    endpoints: (builder) => ({
        // Health check endpoint
        getHealth: builder.query<any, void>({
            query: () => '/health',
        }),
    }),
});

export const { useGetHealthQuery } = api;
