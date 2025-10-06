import { prisma } from "../lib/prisma.js";
import type {
  CreateMessageData,
  UpdateMessageData,
} from "../types/database.js";

export class MessageRepository {
  /**
   * 创建新消息
   */
  static async create(data: CreateMessageData) {
    return prisma.message.create({
      data: {
        conversationId: data.conversationId,
        role: data.role,
        content: data.content,
      },
    });
  }

  /**
   * 根据ID查找消息
   */
  static async findById(id: string) {
    return prisma.message.findUnique({
      where: { id },
      include: {
        conversation: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  /**
   * 获取会话的所有消息
   */
  static async findByConversationId(
    conversationId: string,
    skip: number = 0,
    take: number = 50
  ) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
      skip,
      take,
    });
  }

  /**
   * 获取会话的最新消息
   */
  static async findLatestByConversationId(
    conversationId: string,
    limit: number = 10
  ) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  /**
   * 更新消息内容
   */
  static async update(id: string, data: UpdateMessageData) {
    return prisma.message.update({
      where: { id },
      data: {
        ...(data.content && { content: data.content }),
      },
    });
  }

  /**
   * 删除消息
   */
  static async delete(id: string) {
    return prisma.message.delete({
      where: { id },
    });
  }

  /**
   * 检查消息是否存在
   */
  static async exists(id: string): Promise<boolean> {
    const message = await prisma.message.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!message;
  }

  /**
   * 获取消息统计信息
   */
  static async getStats(conversationId: string) {
    const messageCount = await prisma.message.count({
      where: { conversationId },
    });

    const roleStats = await prisma.message.groupBy({
      by: ["role"],
      where: { conversationId },
      _count: {
        id: true,
      },
    });

    return {
      totalCount: messageCount,
      roleStats: roleStats.map((stat) => ({
        role: stat.role,
        count: stat._count.id,
      })),
    };
  }

  /**
   * 批量删除消息
   */
  static async deleteMany(messageIds: string[]) {
    return prisma.message.deleteMany({
      where: {
        id: { in: messageIds },
      },
    });
  }

  /**
   * 根据会话ID删除所有消息
   */
  static async deleteByConversationId(conversationId: string) {
    return prisma.message.deleteMany({
      where: { conversationId },
    });
  }

  /**
   * 搜索消息内容
   */
  static async searchContent(
    conversationId: string,
    searchTerm: string,
    skip: number = 0,
    take: number = 20
  ) {
    return prisma.message.findMany({
      where: {
        conversationId,
        content: {
          contains: searchTerm,
          mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  }
}
