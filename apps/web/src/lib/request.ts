import axios, { AxiosError } from "axios";
import type { AxiosRequestConfig } from "axios";
import { toast } from "sonner";
import { useUserStore } from "@/stores/useUserStore";

const instance = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_URL + '/api',
  timeout: 600_000,
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use(
  async (config) => {
    try {
      config.headers.authorization =
        "Bearer " + useUserStore.getState().token || "";
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

instance.interceptors.response.use(
  async (response) => {
    return response;
  },
  (error: AxiosError) => {  
    toast.error(error.message, {
      description: (error.response?.data as any)?.message
    });
    return Promise.reject(error);
  },
);

const request = async <T = any>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> => {
  return new Promise((resolve, reject) => {
    instance(url, config)
      .then((res) => resolve(res.data as T))
      .catch(reject);
  });
};

export const http = instance;

export default request;
