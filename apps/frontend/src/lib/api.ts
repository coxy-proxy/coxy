import { useAuth } from '@clerk/nextjs';
import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Create axios instance
export const apiClient = axios.create({
  baseURL: `${BASE_URL}/api`,
  timeout: 10000,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const { getToken } = useAuth();
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      // Handle unauthorized access
      window.location.href = '/sign-in';
    }
    return Promise.reject(error);
  },
);
