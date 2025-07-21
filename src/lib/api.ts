import axios, { AxiosError, AxiosInstance } from "axios";

import { env } from "@/constants/env";

// Custom Axios instance with common configurations
const api: AxiosInstance = axios.create({
  baseURL: env.aiBackendUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add authentication token
api.interceptors.request.use(
  async (config) => {
    config.headers = config.headers || {};

    return config;
  },
  (error: AxiosError) => {
    console.error("[API Request error]", error);

    return Promise.reject(error);
  }
);

// Response interceptor to standardize response format
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error: AxiosError) => {
    console.error("[API Response error]", error?.response?.data);

    return Promise.reject(error?.response?.data);
  }
);

export { api };
