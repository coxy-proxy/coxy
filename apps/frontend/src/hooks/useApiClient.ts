import axios from 'axios';

const instanceFactory = () => {
  // Create axios instance with relative API base URL (proxied via gateway)
  const instance = axios.create({
    baseURL: `/api`,
    timeout: 10000,
    withCredentials: true, // Include cookies in requests
  });

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (typeof window !== 'undefined' && error.response?.status === 401) {
        // Handle unauthorized access - redirect to login
        window.location.href = '/auth/login';
      }
      return Promise.reject(error);
    },
  );
  return instance;
};

const instance = instanceFactory();

// Authenticated API client (cookies are automatically included)
export function useAuthedApiClient() {
  return instance;
}

// For client-side usage (same as authed since cookies are automatic)
export function useApiClient() {
  return instance;
}
