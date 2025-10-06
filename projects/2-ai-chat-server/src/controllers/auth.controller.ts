import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { registerUserSchema, loginUserSchema } from "../lib/validations.js";

export class AuthController {
  /**
   * 用户注册
   */
  static async register(req: Request, res: Response) {
    try {
      // 使用 Zod schema 验证请求体
      const validationResult = registerUserSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "请求数据验证失败",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      const { name, email, password } = validationResult.data;

      // 执行注册
      const result = await AuthService.register({ name, email, password });

      if (!result.success) {
        return res.status(400).json(result);
      }

      res.status(201).json({
        success: true,
        message: "注册成功",
        data: {
          user: result.user,
          token: result.token,
        },
      });
      return;
    } catch (error) {
      console.error("注册控制器错误:", error);
      res.status(500).json({
        success: false,
        error: "服务器内部错误",
      });
      return;
    }
  }

  /**
   * 用户登录
   */
  static async login(req: Request, res: Response) {
    try {
      // 使用 Zod schema 验证请求体
      const validationResult = loginUserSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: "请求数据验证失败",
          details: validationResult.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      const { email, password } = validationResult.data;

      // 执行登录
      const result = await AuthService.login({ email, password });

      if (!result.success) {
        return res.status(401).json(result);
      }

      res.json({
        success: true,
        message: "登录成功",
        data: {
          user: result.user,
          token: result.token,
        },
      });
      return;
    } catch (error) {
      console.error("登录控制器错误:", error);
      res.status(500).json({
        success: false,
        error: "服务器内部错误",
      });
      return;
    }
  }
}
