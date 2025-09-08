import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";

// 这个文件和resourceAuth.ts是AI生成的，用来处理Server action中重复的用户认证逻辑
type AuthResult<T> =
  | { success: true; userId: string; data?: T }
  | { success: false; error: string };

/**
 * 高阶函数：为server action提供统一的认证处理
 * 这是Next.js 15 + Clerk的最佳实践
 */
export function withAuth<T = void>(
  handler: (userId: string, data?: T) => Promise<any>
) {
  return async (data?: T): Promise<AuthResult<T>> => {
    try {
      const { userId } = await getCurrentUser();

      if (userId == null) {
        return {
          success: false,
          error: "You don't have permission to do this",
        };
      }

      const result = await handler(userId, data);
      return { success: true, userId, data: result };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };
}

/**
 * 带重定向的认证装饰器（用于需要redirect的场景）
 * 支持必需数据参数
 */
export function withAuthRedirect<T>(
  handler: (userId: string, data: T) => Promise<void>
) {
  return async (data: T): Promise<{ error: true; message: string } | void> => {
    const { userId } = await getCurrentUser();

    if (userId == null) {
      return {
        error: true,
        message: "You don't have permission to do this",
      };
    }

    try {
      await handler(userId, data);
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };
}

/**
 * 带重定向的认证装饰器（用于需要redirect的场景）
 * 支持可选数据参数
 */
export function withAuthRedirectOptional<T = void>(
  handler: (userId: string, data?: T) => Promise<void>
) {
  return async (data?: T): Promise<{ error: true; message: string } | void> => {
    const { userId } = await getCurrentUser();

    if (userId == null) {
      return {
        error: true,
        message: "You don't have permission to do this",
      };
    }

    try {
      await handler(userId, data);
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };
}

/**
 * 用于interviews actions的认证装饰器
 * 返回格式：{ error: true; message: string } | { error: false; data: T }
 */
export function withAuthInterview<T>(
  handler: (userId: string, data: T) => Promise<{ error: false; data: any }>
) {
  return async (
    data: T
  ): Promise<
    { error: true; message: string } | { error: false; data: any }
  > => {
    const { userId } = await getCurrentUser();

    if (userId == null) {
      return {
        error: true,
        message: "You don't have permission to do this",
      };
    }

    try {
      const result = await handler(userId, data);
      return result;
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };
}

/**
 * 用于interviews actions的认证装饰器（无参数版本）
 * 返回格式：{ error: true; message: string } | { error: false; data: T }
 */
export function withAuthInterviewNoParam<T>(
  handler: (userId: string, data: T) => Promise<{ error: false; data: any }>
) {
  return async (
    data: T
  ): Promise<
    { error: true; message: string } | { error: false; data: any }
  > => {
    const { userId } = await getCurrentUser();

    if (userId == null) {
      return {
        error: true,
        message: "You don't have permission to do this",
      };
    }

    try {
      const result = await handler(userId, data);
      return result;
    } catch (error) {
      return {
        error: true,
        message: error instanceof Error ? error.message : "An error occurred",
      };
    }
  };
}
