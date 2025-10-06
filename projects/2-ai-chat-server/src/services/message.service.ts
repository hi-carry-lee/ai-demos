import { MessageRepository } from "../repositories/message.repository.js";
import { ConversationService } from "./conversation.service.js";
import type {
  CreateMessageData,
  UpdateMessageData,
} from "../types/database.js";

export class MessageService {
  /**
   * 创建新消息
   */
  static async createMessage(data: CreateMessageData) {
    // 验证会话是否存在
    const conversationExists =
      await ConversationService.validateConversationExists(data.conversationId);
    if (!conversationExists) {
      throw new Error("会话不存在");
    }

    // 插入消息

    // 调用AI模型获取回复

    // 插入新回复的消息

    return MessageRepository.create(data);
  }

  /**
   * 根据ID查找消息
   */
  static async findMessageById(id: string) {
    return MessageRepository.findById(id);
  }

  /**
   * 获取会话的所有消息
   */
  static async getMessagesByConversation(
    conversationId: string,
    skip: number = 0,
    take: number = 50
  ) {
    // 验证会话是否存在
    const conversationExists =
      await ConversationService.validateConversationExists(conversationId);
    if (!conversationExists) {
      throw new Error("会话不存在");
    }

    return MessageRepository.findByConversationId(conversationId, skip, take);
  }

  /**
   * 获取会话的最新消息
   */
  static async getLatestMessagesByConversation(
    conversationId: string,
    limit: number = 10
  ) {
    // 验证会话是否存在
    const conversationExists =
      await ConversationService.validateConversationExists(conversationId);
    if (!conversationExists) {
      throw new Error("会话不存在");
    }

    return MessageRepository.findLatestByConversationId(conversationId, limit);
  }

  /**
   * 更新消息内容
   */
  static async updateMessage(id: string, data: UpdateMessageData) {
    // 检查消息是否存在
    const exists = await MessageRepository.exists(id);
    if (!exists) {
      throw new Error("消息不存在");
    }

    return MessageRepository.update(id, data);
  }

  /**
   * 删除消息
   */
  static async deleteMessage(id: string) {
    // 检查消息是否存在
    const exists = await MessageRepository.exists(id);
    if (!exists) {
      throw new Error("消息不存在");
    }

    return MessageRepository.delete(id);
  }

  /**
   * 检查消息是否存在
   */
  static async validateMessageExists(messageId: string): Promise<boolean> {
    return MessageRepository.exists(messageId);
  }

  /**
   * 获取消息统计信息
   */
  static async getMessageStats(conversationId: string) {
    // 验证会话是否存在
    const conversationExists =
      await ConversationService.validateConversationExists(conversationId);
    if (!conversationExists) {
      throw new Error("会话不存在");
    }

    return MessageRepository.getStats(conversationId);
  }

  /**
   * 批量删除消息
   */
  static async deleteMessages(messageIds: string[]) {
    if (messageIds.length === 0) {
      throw new Error("消息ID列表不能为空");
    }

    return MessageRepository.deleteMany(messageIds);
  }

  /**
   * 根据会话ID删除所有消息
   */
  static async deleteMessagesByConversation(conversationId: string) {
    // 验证会话是否存在
    const conversationExists =
      await ConversationService.validateConversationExists(conversationId);
    if (!conversationExists) {
      throw new Error("会话不存在");
    }

    return MessageRepository.deleteByConversationId(conversationId);
  }

  /**
   * 搜索消息内容
   */
  static async searchMessages(
    conversationId: string,
    searchTerm: string,
    skip: number = 0,
    take: number = 20
  ) {
    // 验证会话是否存在
    const conversationExists =
      await ConversationService.validateConversationExists(conversationId);
    if (!conversationExists) {
      throw new Error("会话不存在");
    }

    if (!searchTerm.trim()) {
      throw new Error("搜索词不能为空");
    }

    return MessageRepository.searchContent(
      conversationId,
      searchTerm,
      skip,
      take
    );
  }
}
