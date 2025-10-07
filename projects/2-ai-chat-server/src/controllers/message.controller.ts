import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createMessageSchema,
  updateMessageSchema,
  paginationQuerySchema,
  messageIdParamSchema,
  conversationIdParamSchemaForMessages,
} from '../lib/validations.js';
import { ConversationService } from '../services/conversation.service.js';
import { multiTurnChat } from '../services/gemini.service.js';
import { MessageService } from '../services/message.service.js';

export class MessageController {
  /**
   * 创建新消息
   */

  static async createMessage(req: Request, res: Response) {
    try {
      // 使用 Zod schema 验证请求体
      const validationResult = createMessageSchema.safeParse(req.body);

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

      const userId = req.userId;

      const { conversationId, content } = validationResult.data;

      const message = await multiTurnChat(content, conversationId, userId);

      res.status(201).json({
        success: true,
        message: '消息创建成功',
        data: { message },
      });
      return;
    } catch (error) {
      console.error('创建消息控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 获取会话的所有消息
   */
  static async getMessagesByConversation(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = conversationIdParamSchemaForMessages.safeParse(
        req.params
      );

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

      const { conversationId } = paramValidation.data;
      const userId = req.userId;
      const { page, limit } = queryValidation.data;
      const skip = (page - 1) * limit;

      // 检查会话是否存在
      const conversation =
        await ConversationService.findConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '会话不存在',
        });
      }

      // 检查权限
      if (conversation.userId && conversation.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权查看此会话的消息',
        });
      }

      const messages = await MessageService.getMessagesByConversation(
        conversationId,
        skip,
        limit
      );

      res.json({
        success: true,
        data: {
          messages,
          pagination: {
            page,
            limit,
            total: messages.length,
          },
        },
      });
      return;
    } catch (error) {
      console.error('获取会话消息控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 获取会话的最新消息
   */
  static async getLatestMessages(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = conversationIdParamSchemaForMessages.safeParse(
        req.params
      );

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

      // 验证查询参数（只验证 limit）
      const limitValidation = z
        .string()
        .optional()
        .transform(val => (val ? parseInt(val, 10) : 10))
        .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100')
        .safeParse(req.query.limit);

      if (!limitValidation.success) {
        return res.status(400).json({
          success: false,
          error: '查询参数验证失败',
          details: limitValidation.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      }

      const { conversationId } = paramValidation.data;
      const userId = req.userId;
      const limit = limitValidation.data;

      // 检查会话是否存在
      const conversation =
        await ConversationService.findConversationById(conversationId);
      if (!conversation) {
        return res.status(404).json({
          success: false,
          error: '会话不存在',
        });
      }

      // 检查权限
      if (conversation.userId && conversation.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: '无权查看此会话的消息',
        });
      }

      const messages = await MessageService.getLatestMessagesByConversation(
        conversationId,
        limit
      );

      res.json({
        success: true,
        data: { messages },
      });
      return;
    } catch (error) {
      console.error('获取最新消息控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 根据ID获取消息详情
   */
  static async getMessageById(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = messageIdParamSchema.safeParse(req.params);

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
      const userId = req.userId;

      const message = await MessageService.findMessageById(id);

      if (!message) {
        return res.status(404).json({
          success: false,
          error: '消息不存在',
        });
      }

      // 检查权限：通过会话检查权限
      if (
        message.conversation.userId &&
        message.conversation.userId !== userId
      ) {
        return res.status(403).json({
          success: false,
          error: '无权查看此消息',
        });
      }

      res.json({
        success: true,
        data: { message },
      });
      return;
    } catch (error) {
      console.error('获取消息详情控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 更新消息内容
   */
  static async updateMessage(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = messageIdParamSchema.safeParse(req.params);

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
      const bodyValidation = updateMessageSchema.safeParse(req.body);

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
      const { content } = bodyValidation.data;
      const userId = req.userId;

      // 检查消息是否存在
      const existingMessage = await MessageService.findMessageById(id);
      if (!existingMessage) {
        return res.status(404).json({
          success: false,
          error: '消息不存在',
        });
      }

      // 检查权限
      if (
        existingMessage.conversation.userId &&
        existingMessage.conversation.userId !== userId
      ) {
        return res.status(403).json({
          success: false,
          error: '无权修改此消息',
        });
      }

      const updatedMessage = await MessageService.updateMessage(id, {
        content,
      });

      res.json({
        success: true,
        message: '消息更新成功',
        data: { message: updatedMessage },
      });
      return;
    } catch (error) {
      console.error('更新消息控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }

  /**
   * 删除消息
   */
  static async deleteMessage(req: Request, res: Response) {
    try {
      // 验证路径参数
      const paramValidation = messageIdParamSchema.safeParse(req.params);

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
      const userId = req.userId;

      // 检查消息是否存在
      const existingMessage = await MessageService.findMessageById(id);
      if (!existingMessage) {
        return res.status(404).json({
          success: false,
          error: '消息不存在',
        });
      }

      // 检查权限
      if (
        existingMessage.conversation.userId &&
        existingMessage.conversation.userId !== userId
      ) {
        return res.status(403).json({
          success: false,
          error: '无权删除此消息',
        });
      }

      await MessageService.deleteMessage(id);

      res.json({
        success: true,
        message: '消息删除成功',
      });
      return;
    } catch (error) {
      console.error('删除消息控制器错误:', error);
      res.status(500).json({
        success: false,
        error: '服务器内部错误',
      });
      return;
    }
  }
}
