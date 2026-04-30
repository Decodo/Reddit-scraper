import axios from 'axios';
import { toast } from 'sonner';

export const api = axios.create({
  baseURL: import.meta.env.PUBLIC_API_BASE_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 403) {
      toast.error(message || "You don't have permission to perform this action");
    }

    if (status >= 500) {
      toast.error(message || 'Something went wrong. Please try again.');
    }

    return Promise.reject(error);
  },
);
