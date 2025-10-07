// backend/src/services/gemini.service.ts
import { GoogleGenAI, type Chat } from '@google/genai';

// 不需要传 apiKey，自动从环境变量读取 GEMINI_API_KEY 或 GOOGLE_API_KEY
const client = new GoogleGenAI({});

// 存储每个用户的聊天会话
const userChatSessions = new Map<string, Chat>();

// 单轮对话
export async function singleTurnChat(prompt: string) {
  const response = await client.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
}

// 为特定用户创建或获取聊天会话
function getOrCreateUserChat(userId: string) {
  if (!userChatSessions.has(userId)) {
    const chat = client.chats.create({
      model: 'gemini-2.5-flash',
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hello' }],
        },
        {
          role: 'model',
          parts: [{ text: 'Great to meet you. What would you like to know?' }],
        },
      ],
    });
    userChatSessions.set(userId, chat);
    return chat; // 直接返回新创建的 chat
  }
  return userChatSessions.get(userId);
}

// 多轮对话 - 支持用户ID
export async function multiTurnChat(prompt: string, userId: string) {
  const chat = getOrCreateUserChat(userId);
  const response = await chat?.sendMessage({
    message: prompt,
  });
  return response?.text;
}
