import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

const instanceFactory = () => {
  const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  // Create axios instance
  const instance = axios.create({
    baseURL: `${BASE_URL}/api`,
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

// For client-side usage
export function useApiClient() {
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
