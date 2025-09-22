import { api } from '../api';

// Types for authentication
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'USER';
  };
  token: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface VerifyTokenResponse {
  user: {
    id: string;
    email: string;
    username: string;
    firstName?: string;
    lastName?: string;
    role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE' | 'USER';
  };
}

export const authApi = api.injectEndpoints({
  endpoints: (builder) => ({
    // Login user
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/api/auth/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Register user
    register: builder.mutation<LoginResponse, RegisterRequest>({
      query: (userData) => ({
        url: '/api/auth/register',
        method: 'POST',
        body: userData,
      }),
      invalidatesTags: ['Auth'],
    }),

    // Verify token
    verifyToken: builder.query<VerifyTokenResponse, void>({
      query: () => '/api/auth/verify',
      providesTags: ['Auth'],
    }),

    // Logout user
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/api/auth/logout',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),

    // Refresh token
    refreshToken: builder.mutation<LoginResponse, void>({
      query: () => ({
        url: '/api/auth/refresh',
        method: 'POST',
      }),
      invalidatesTags: ['Auth'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyTokenQuery,
  useLogoutMutation,
  useRefreshTokenMutation,
} = authApi;
