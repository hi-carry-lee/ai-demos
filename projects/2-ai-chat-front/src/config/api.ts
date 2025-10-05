// client/src/api/client.ts

// ============ 1. 环境变量获取 ============
// Vite 通过 import.meta.env 暴露环境变量（必须以 VITE_ 开头）
// 开发环境：/api（由 Vite proxy 代理到 http://localhost:3000/api）
// 生产环境：/api（由 Express 直接处理）
const API_BASE = import.meta.env.VITE_API_BASE || '/api';

// ============ 2. 类型定义 ============
// 扩展原生 RequestInit，增加查询参数支持
// TypeScript 内置的类型定义，因为原生 fetch 没有查询参数的概念
// 描述的是浏览器原生 fetch API 的标准接口
interface FetchOptions extends RequestInit {
  params?: Record<string, string>; // GET 请求的查询参数
}

// ============ 3. 核心类设计 ============
// 为什么使用class封装？Class 适合需要维护状态的场景（如 token、baseUrl）
// object在私有属性和继承扩展上不方便，函数式更加不方便
class ApiClient {
  private baseUrl: string; // 基础 URL，私有属性，外部不可访问

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl; // 实例化时传入 /api
  }

  // ============ 4. 通用请求方法（供其他方法调用） ============
  /**
   * 泛型方法：<T> 表示返回值类型由调用者指定
   * @param endpoint - API 端点，如 '/users'
   * @param options - 请求选项（方法、参数、headers 等）
   * @returns Promise<T> - 解析后的 JSON 数据
   */
  private async request<T>(
    endpoint: string,
    options: FetchOptions = {}
  ): Promise<T> {
    // 解构：分离 params 和其他 fetch 选项
    const { params, ...fetchOptions } = options;

    let url = `${this.baseUrl}${endpoint}`; // 拼接完整 URL

    // ============ 5. 查询参数处理 ============
    // URLSearchParams：浏览器原生的 JavaScript **类**，专门处理查询参数
    // 简单场景用原生，复杂场景（嵌套对象、数组）用 qs 或 query-string
    if (params) {
      // URLSearchParams 自动处理编码：{ id: '1', name: 'John Doe' }
      // → ?id=1&name=John%20Doe
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    // ============ 6. 发送请求 ============
    const response = await fetch(url, {
      ...fetchOptions, // 展开其他选项（method, body 等）
      headers: {
        'Content-Type': 'application/json', // 默认 JSON
        ...fetchOptions.headers, // 允许覆盖
      },
    });

    // ============ 7. 错误处理 ============
    if (!response.ok) {
      // 尝试解析后端返回的错误信息
      const error = await response.json().catch(() => ({
        message: 'Request failed',
      }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    // ============ 8. 返回解析后的数据 ============
    return response.json(); // 自动推断为类型 T
  }

  // ============ 9. 便捷方法 ============
  // GET：获取资源
  get<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  // POST：创建资源
  post<T>(
    endpoint: string,
    data?: unknown,
    options?: FetchOptions
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data), // 自动序列化
    });
  }

  // PUT：完整更新资源
  put<T>(endpoint: string, data?: unknown, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // DELETE：删除资源
  delete<T>(endpoint: string, options?: FetchOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

// ============ 10. 导出单例 ============
// 全局唯一实例，避免重复创建
export const api = new ApiClient(API_BASE);
