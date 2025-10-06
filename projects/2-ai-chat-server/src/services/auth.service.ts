import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserService } from "./user.service.js";
import type {
  LoginUserData,
  RegisterUserData,
  AuthResult,
} from "../types/database.js";
import { UserRepository } from "../repositories/user.repository.js";

export class AuthService {
  private static readonly JWT_SECRET =
    process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN = "7d";
  private static readonly SALT_ROUNDS = 12;

  /**
   * 用户注册
   */
  static async register(data: RegisterUserData): Promise<AuthResult> {
    try {
      // 加密密码
      const hashedPassword = await bcrypt.hash(data.password, this.SALT_ROUNDS);

      // 创建用户（UserService会处理邮箱重复检查）
      const user = await UserRepository.create({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      });

      // 生成JWT token
      const token = this.generateToken(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      };
    } catch (error) {
      console.error("注册失败:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "注册失败，请稍后重试",
      };
    }
  }

  /**
   * 用户登录
   */
  static async login(data: LoginUserData): Promise<AuthResult> {
    try {
      // 查找用户
      const user = await UserService.findUserByEmail(data.email);
      if (!user) {
        return {
          success: false,
          error: "邮箱或密码错误",
        };
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        return {
          success: false,
          error: "邮箱或密码错误",
        };
      }

      // 生成JWT token
      const token = this.generateToken(user.id);

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        },
        token,
      };
    } catch (error) {
      console.error("登录失败:", error);
      return {
        success: false,
        error: "登录失败，请稍后重试",
      };
    }
  }

  /**
   * 验证JWT token
   */
  static async verifyToken(
    token: string
  ): Promise<{ success: boolean; userId?: string; error?: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };

      // 验证用户是否仍然存在
      const userExists = await UserService.validateUserExists(decoded.userId);
      if (!userExists) {
        return {
          success: false,
          error: "用户不存在",
        };
      }

      return {
        success: true,
        userId: decoded.userId,
      };
    } catch (error) {
      if (error instanceof jwt.JsonWebTokenError) {
        return {
          success: false,
          error: "无效的token",
        };
      }
      if (error instanceof jwt.TokenExpiredError) {
        return {
          success: false,
          error: "token已过期",
        };
      }
      return {
        success: false,
        error: "token验证失败",
      };
    }
  }

  /**
   * 刷新token
   */
  static async refreshToken(
    userId: string
  ): Promise<{ success: boolean; token?: string; error?: string }> {
    try {
      // 验证用户是否存在
      const userExists = await UserService.validateUserExists(userId);
      if (!userExists) {
        return {
          success: false,
          error: "用户不存在",
        };
      }

      // 生成新的token
      const token = this.generateToken(userId);

      return {
        success: true,
        token,
      };
    } catch (error) {
      console.error("刷新token失败:", error);
      return {
        success: false,
        error: "刷新token失败",
      };
    }
  }

  /**
   * 生成JWT token
   */
  private static generateToken(userId: string): string {
    return jwt.sign({ userId }, this.JWT_SECRET, {
      expiresIn: this.JWT_EXPIRES_IN,
    });
  }

  /**
   * 从请求头中提取token
   */
  static extractTokenFromHeader(authHeader: string | undefined): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return null;
    }

    return parts[1] || null;
  }
}
