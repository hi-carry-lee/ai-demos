import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

// 创建 axios 实例
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 自动添加 token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 从 localStorage 获取 token
    const token = localStorage.getItem('token');

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误和 token 过期
axiosInstance.interceptors.response.use(
  response => {
    return response.data;
  },
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      // token 过期或无效
      if (status === 401) {
        // 清除 token
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // 跳转到登录页
        window.location.href = '/login';
      }

      // 其他错误
      const errorData = error.response.data as { message?: string };
      const errorMessage = errorData?.message || '请求失败';
      return Promise.reject(new Error(errorMessage));
    }

    return Promise.reject(error);
  }
);

// 导出工具函数
export const setToken = (token: string) => {
  localStorage.setItem('token', token);
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const removeToken = () => {
  localStorage.removeItem('token');
};

export const setUser = (user: Record<string, unknown>) => {
  localStorage.setItem('user', JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const removeUser = () => {
  localStorage.removeItem('user');
};

export default axiosInstance;
