// backend/src/services/gemini.service.ts
import { GoogleGenAI } from "@google/genai";

// 不需要传 apiKey，自动从环境变量读取 GEMINI_API_KEY 或 GOOGLE_API_KEY
const client = new GoogleGenAI({});

// 单轮对话
export async function singleTurnChat(prompt: string) {
  const response = await client.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text;
}

// 创建多轮对话的聊天对象
const chat = client.chats.create({
  model: "gemini-2.5-flash",
  history: [
    {
      role: "model",
      parts: [{ text: "你好！我是ChatAI助手，有什么可以帮助你的吗？" }],
    },
  ],
});

// 多轮对话
export async function multiTurnChat(prompt: string) {
  const response = await chat.sendMessage({
    message: prompt,
  });
  return response.text;
}
