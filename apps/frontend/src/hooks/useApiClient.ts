import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

const instanceFactory = () => {
  // Create axios instance with relative API base URL (proxied via gateway)
  const instance = axios.create({
    baseURL: `/api`,
    timeout: 10000,
  });

  // Response interceptor for error handling
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (typeof window !== 'undefined' && error.response?.status === 401) {
        // Handle unauthorized access
        window.location.href = '/sign-in';
      }
      return Promise.reject(error);
    },
  );
  return instance;
};
const instance = instanceFactory();

// TODO: when AUTH_ENABLED=true, use the authed API client
export function useAuthedApiClient() {
  const { getToken } = useAuth();

  instance.interceptors.request.clear();
  instance.interceptors.request.use(
    async (config) => {
      const token = await getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => Promise.reject(error),
  );
  return instance;
}

// For client-side usage
export function useApiClient() {
  return instance;
}
