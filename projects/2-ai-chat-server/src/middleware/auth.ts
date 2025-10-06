import type { Request, Response, NextFunction } from "express";
import { AuthService } from "../services/auth.service.js";

// 扩展Request类型以包含userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

/**
 * 认证中间件 - 验证JWT token
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    const token = AuthService.extractTokenFromHeader(authHeader);

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "缺少认证token",
      });
    }

    const result = await AuthService.verifyToken(token);

    if (!result.success) {
      return res.status(401).json(result);
    }

    if (!result.userId) {
      return res.status(401).json(result);
    }

    // 将用户ID添加到请求对象中
    req.userId = result.userId;
    next();
    return;
  } catch (error) {
    console.error("认证中间件错误:", error);
    res.status(500).json({
      success: false,
      error: "服务器内部错误",
    });
    return;
  }
};
