import type { Request, Response } from 'express';
import {
  createConversationSchema,
  updateConversationSchema,
  paginationQuerySchema,
  conversationIdParamSchema,
} from '../lib/validations.js';
import { ConversationService } from '../services/conversation.service.js';
import type { UpdateConversationData } from '../types/database.js';

export class ConversationController {
  /**
   * 创建新会话
   */
  static async createConversation(req: Request, res: Response) {
    try {
      // 使用 Zod schema 验证请求体
      const validationResult = createConversationSchema.safeParse(req.body);

      if (!validationResult.success) {
        return res.status(400).json({
          success: false,
          error: '请求数据验证失败',
          details: validationResult.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const { title, model } = validationResult.data;
      const userId = req.userId; // 从中间件获取，可能为undefined（匿名用户）

      const conversationData = {
        userId,
        title,
        model,
      };

      const conversation =
        await ConversationService.createConversation(conversationData);

      res.status(201).json({
        success: true,
        message: '会话创建成功',
        data: { conversation },
      });
      return;
    } catch (error) {
      console.error('创建会话控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 获取用户的所有会话
   */
  static async getUserConversations(req: Request, res: Response) {
    try {
      // 验证查询参数
      const queryValidation = paginationQuerySchema.safeParse(req.query);

      if (!queryValidation.success) {
        return res.status(400).json({
          success: false,
          error: '查询参数验证失败',
          details: queryValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const userId = req.userId; // 从中间件获取
      const { page, limit } = queryValidation.data;
      const skip = (page - 1) * limit;

      const conversations = await ConversationService.getConversationsByUser(
        userId,
        skip,
        limit
      );

      res.json({
        success: true,
        data: {
          conversations,
          pagination: {
            page,
            limit,
            total: conversations.length,
          },
        },
      });
      return;
    } catch (error) {
      console.error('获取用户会话控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 根据ID获取会话详情
   */
  static async getConversationById(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = conversationIdParamSchema.safeParse(req.params);

      if (!paramValidation.success) {
        return res.status(400).json({
          success: false,
          error: '路径参数验证失败',
          details: paramValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const { id } = paramValidation.data;

      const conversation = await ConversationService.findConversationById(id);

      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '会话不存在',
        });
      }

      res.json({
        success: true,
        data: { conversation },
      });
      return;
    } catch (error) {
      console.error('获取会话详情控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 更新会话信息
   */
  static async updateConversation(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = conversationIdParamSchema.safeParse(req.params);

      if (!paramValidation.success) {
        return res.status(400).json({
          success: false,
          error: '路径参数验证失败',
          details: paramValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      // 验证请求体
      const bodyValidation = updateConversationSchema.safeParse(req.body);

      if (!bodyValidation.success) {
        return res.status(400).json({
          success: false,
          error: '请求数据验证失败',
          details: bodyValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const { id } = paramValidation.data;
      const { title, status, model } = bodyValidation.data;
      const userId = req.userId;

      // 检查会话是否存在
      const existingConversation =
        await ConversationService.findConversationById(id);
      if (!existingConversation) {
        return res.status(404).json({
          success: false,
          error: '会话不存在',
        });
      }

      // 检查权限
      if (
        existingConversation.userId &&
        existingConversation.userId !== userId
      ) {
        return res.status(403).json({
          success: false,
          error: '无权修改此会话',
        });
      }

      const updateData: UpdateConversationData = {};
      if (title) updateData.title = title;
      if (status) updateData.status = status;
      if (model) updateData.model = model;

      const updatedConversation = await ConversationService.updateConversation(
        id,
        updateData
      );

      res.json({
        success: true,
        message: '会话更新成功',
        data: { conversation: updatedConversation },
      });
      return;
    } catch (error) {
      console.error('更新会话控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  // 根据id删除会话
  static async deleteConversation(req: Request, res: Response) {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          success: false,
          error: '会话id不能为空',
        });
      }

      const existingConversation =
        await ConversationService.findConversationById(id);
      if (!existingConversation) {
        return res.status(404).json({
          success: false,
          error: '会话不存在',
        });
      }

      await ConversationService.deleteConversation(id);
      res.json({
        success: true,
        message: '会话删除成功',
      });
      return;
    } catch (error) {
      console.error('删除会话控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }
}
