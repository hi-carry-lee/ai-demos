import { ConversationRepository } from "../repositories/conversation.repository.js";
import type {
  CreateConversationData,
  UpdateConversationData,
} from "../types/database.js";

export class ConversationService {
  /**
   * 创建新会话
   */
  static async createConversation(data: CreateConversationData) {
    return ConversationRepository.create(data);
  }

  /**
   * 根据ID查找会话
   */
  static async findConversationById(id: string) {
    return ConversationRepository.findById(id);
  }

  /**
   * 检查会话是否存在
   */
  static async validateConversationExists(id: string) {
    return ConversationRepository.exists(id);
  }

  /**
   * 获取用户的所有会话
   */
  static async getConversationsByUser(
    userId: string,
    skip: number = 0,
    take: number = 20
  ) {
    return ConversationRepository.findByUserId(userId, skip, take);
  }

  /**
   * 更新会话信息
   */
  static async updateConversation(id: string, data: UpdateConversationData) {
    // 检查会话是否存在
    const exists = await ConversationRepository.exists(id);
    if (!exists) {
      throw new Error("会话不存在");
    }

    return ConversationRepository.update(id, data);
  }

  /**
   * 删除会话（软删除）
   */
  static async deleteConversation(id: string) {
    // 检查会话是否存在
    const exists = await ConversationRepository.exists(id);
    if (!exists) {
      throw new Error("会话不存在");
    }

    return ConversationRepository.delete(id);
  }

  /**
   * 归档会话
   */
  static async archiveConversation(id: string) {
    // 检查会话是否存在
    const exists = await ConversationRepository.exists(id);
    if (!exists) {
      throw new Error("会话不存在");
    }

    return ConversationRepository.archive(id);
  }
}
