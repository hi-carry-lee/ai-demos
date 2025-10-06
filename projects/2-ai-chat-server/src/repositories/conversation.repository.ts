import { prisma } from "../lib/prisma.js";
import type {
  CreateConversationData,
  UpdateConversationData,
} from "../types/database.js";

export class ConversationRepository {
  /**
   * 创建新会话
   */
  static async create(data: CreateConversationData) {
    return prisma.conversation.create({
      data: {
        userId: data.userId,
        title: data.title,
        model: data.model,
        status: data.status || "active",
      },
    });
  }

  /**
   * 根据ID查找会话
   */
  static async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      include: {
        user: true,
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  /**
   * 获取用户的所有会话
   */
  static async findByUserId(
    userId: string,
    skip: number = 0,
    take: number = 20
  ) {
    return prisma.conversation.findMany({
      where: {
        userId,
        status: "active",
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: { updatedAt: "desc" },
      skip,
      take,
    });
  }

  /**
   * 更新会话信息
   */
  static async update(id: string, data: UpdateConversationData) {
    return prisma.conversation.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.status && { status: data.status }),
        ...(data.model && { model: data.model }),
      },
    });
  }

  /**
   * 删除会话（软删除）
   */
  static async delete(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { status: "deleted" },
    });
  }

  /**
   * 归档会话
   */
  static async archive(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { status: "archived" },
    });
  }

  /**
   * 检查会话是否存在
   */
  static async exists(id: string): Promise<boolean> {
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      select: { id: true },
    });
    return !!conversation;
  }
}
