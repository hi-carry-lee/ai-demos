import { GoogleGenAI } from "@google/genai";
import { MessageRepository } from "../repositories/message.repository.js";
import { ConversationService } from "../services/conversation.service.js";

// 不需要传 apiKey，自动从环境变量读取 GEMINI_API_KEY 或 GOOGLE_API_KEY
const client = new GoogleGenAI({});

// 存储每个会话的聊天对象（会话级别，不是用户级别）
const conversationChatSessions = new Map<string, any>();

// 配置常量
const MODEL_NAME = "gemini-2.5-flash";
const MAX_SESSION_AGE = 30 * 60 * 1000; // 30分钟会话过期

// 会话信息接口
interface ChatSession {
  chat: any;
  lastActivity: number;
  messageCount: number;
}

/**
 * 单轮对话 - 不保存历史
 */
export async function singleTurnChat(prompt: string): Promise<string> {
  try {
    const response = await client.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });

    return response.text || "抱歉，我无法生成回复。";
  } catch (error) {
    console.error("单轮对话错误:", error);
    throw new Error("AI服务暂时不可用");
  }
}

/**
 * 获取或创建会话的聊天对象
 * 优先使用内存中的chat对象，如果不存在则从数据库重建
 */
async function getOrCreateConversationChat(
  conversationId: string,
  userId?: string
) {
  const now = Date.now();
  const sessionKey = `${conversationId}_${userId || "anonymous"}`;

  // 检查内存中是否有有效的会话
  const existingSession = conversationChatSessions.get(
    sessionKey
  ) as ChatSession;

  if (existingSession && now - existingSession.lastActivity < MAX_SESSION_AGE) {
    // 更新活动时间
    existingSession.lastActivity = now;
    return existingSession.chat;
  }

  // 从数据库重建会话
  const messages = await MessageRepository.findByConversationId(
    conversationId,
    0,
    50
  );

  // 构建历史记录
  console.log("33333", messages);
  const history = messages.map((msg) => ({
    role: msg.role as "user" | "model",
    parts: [{ text: msg.content }],
  }));
  console.log("44444", history);
  // 创建新的chat对象
  const chat = client.chats.create({
    model: MODEL_NAME,
    history,
  });

  // 存储到内存中
  conversationChatSessions.set(sessionKey, {
    chat,
    lastActivity: now,
    messageCount: messages.length,
  });

  return chat;
}

/**
 * 多轮对话 - 混合方案：内存chat对象 + 数据库持久化
 */
export async function multiTurnChat(
  prompt: string,
  conversationId: string,
  userId?: string
): Promise<{ message: string; messageId: string }> {
  try {
    // 1. 验证会话是否存在
    const conversation = await ConversationService.findConversationById(
      conversationId
    );
    console.log("11111");
    if (!conversation) {
      throw new Error("会话不存在");
    }

    // 2. 权限检查
    if (userId && conversation.userId && conversation.userId !== userId) {
      throw new Error("无权访问此会话");
    }

    // 3. 保存用户消息到数据库
    const userMessage = await MessageRepository.create({
      conversationId,
      role: "user",
      content: prompt,
    });
    console.log("22222");

    // 4. 获取或创建chat对象（优先使用内存，否则从数据库重建）
    const chat = await getOrCreateConversationChat(conversationId, userId);

    // 5. 发送消息（Gemini SDK会自动管理历史，不重复发送）
    const response = await chat.sendMessage({
      message: prompt,
    });

    const aiResponse = response.text || "抱歉，我无法生成回复。";

    // 6. 保存AI回复到数据库
    const aiMessage = await MessageRepository.create({
      conversationId,
      role: "model",
      content: aiResponse,
    });

    // 7. 更新会话信息
    const sessionKey = `${conversationId}_${userId}`;
    const session = conversationChatSessions.get(sessionKey) as ChatSession;
    if (session) {
      session.lastActivity = Date.now();
      session.messageCount += 2; // 用户消息 + AI回复
    }

    return {
      message: aiMessage.content,
      messageId: aiMessage.id,
    };
  } catch (error) {
    console.error("多轮对话错误:", error);

    if (
      error instanceof Error &&
      (error.message.includes("会话不存在") ||
        error.message.includes("无权访问"))
    ) {
      throw error;
    }

    throw new Error("AI服务暂时不可用");
  }
}

/**
 * 流式多轮对话
 */
export async function streamMultiTurnChat(
  prompt: string,
  conversationId: string,
  userId?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  try {
    // 验证和保存用户消息（同上面）
    const conversation = await ConversationService.findConversationById(
      conversationId
    );
    if (!conversation) {
      throw new Error("会话不存在");
    }

    if (userId && conversation.userId && conversation.userId !== userId) {
      throw new Error("无权访问此会话");
    }

    await MessageRepository.create({
      conversationId,
      role: "user",
      content: prompt,
    });

    // 获取chat对象
    const chat = await getOrCreateConversationChat(conversationId, userId);

    let fullResponse = "";

    // 流式发送消息
    const stream = await chat.sendMessageStream({
      message: prompt,
    });

    // 处理流式响应
    for await (const chunk of stream) {
      const chunkText = chunk.text || "";
      fullResponse += chunkText;

      if (onChunk) {
        onChunk(chunkText);
      }
    }

    // 保存完整回复
    if (fullResponse) {
      await MessageRepository.create({
        conversationId,
        role: "model",
        content: fullResponse,
      });

      // 更新会话信息
      const sessionKey = `${conversationId}_${userId || "anonymous"}`;
      const session = conversationChatSessions.get(sessionKey) as ChatSession;
      if (session) {
        session.lastActivity = Date.now();
        session.messageCount += 2;
      }
    }

    return fullResponse;
  } catch (error) {
    console.error("流式多轮对话错误:", error);

    if (
      error instanceof Error &&
      (error.message.includes("会话不存在") ||
        error.message.includes("无权访问"))
    ) {
      throw error;
    }

    throw new Error("AI服务暂时不可用");
  }
}

/**
 * 获取对话历史（从数据库）
 */
export async function getConversationHistory(
  conversationId: string,
  userId?: string,
  limit: number = 50
) {
  try {
    const conversation = await ConversationService.findConversationById(
      conversationId
    );
    if (!conversation) {
      throw new Error("会话不存在");
    }

    if (userId && conversation.userId && conversation.userId !== userId) {
      throw new Error("无权访问此会话");
    }

    return MessageRepository.findByConversationId(conversationId, 0, limit);
  } catch (error) {
    console.error("获取对话历史错误:", error);
    throw error;
  }
}

/**
 * 清除对话历史
 */
export async function clearConversationHistory(
  conversationId: string,
  userId?: string
) {
  try {
    const conversation = await ConversationService.findConversationById(
      conversationId
    );
    if (!conversation) {
      throw new Error("会话不存在");
    }

    if (userId && conversation.userId && conversation.userId !== userId) {
      throw new Error("无权访问此会话");
    }

    // 清除数据库中的消息
    await MessageRepository.deleteByConversationId(conversationId);

    // 清除内存中的会话
    const sessionKey = `${conversationId}_${userId || "anonymous"}`;
    conversationChatSessions.delete(sessionKey);

    return { success: true, message: "对话历史已清除" };
  } catch (error) {
    console.error("清除对话历史错误:", error);
    throw error;
  }
}

/**
 * 清理过期的内存会话
 */
export function cleanupExpiredSessions() {
  const now = Date.now();
  const expiredKeys: string[] = [];

  for (const [key, session] of conversationChatSessions.entries()) {
    if (now - session.lastActivity > MAX_SESSION_AGE) {
      expiredKeys.push(key);
    }
  }

  expiredKeys.forEach((key) => {
    conversationChatSessions.delete(key);
  });

  console.log(`清理了 ${expiredKeys.length} 个过期会话`);
}

/**
 * 获取活跃会话统计
 */
export function getActiveSessionsStats() {
  const now = Date.now();
  const activeSessions = Array.from(conversationChatSessions.values()).filter(
    (session) => now - session.lastActivity < MAX_SESSION_AGE
  );

  return {
    totalSessions: conversationChatSessions.size,
    activeSessions: activeSessions.length,
    totalMessages: activeSessions.reduce(
      (sum, session) => sum + session.messageCount,
      0
    ),
  };
}

// 定期清理过期会话（每10分钟）
setInterval(cleanupExpiredSessions, 10 * 60 * 1000);
