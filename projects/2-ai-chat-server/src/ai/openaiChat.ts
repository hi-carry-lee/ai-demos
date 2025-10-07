import { OpenAI } from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions.mjs';

import { env } from '../config/env.js';

// 因为OpenAI不提供免费额度，所以使用SiliconFlow的免费模型
const openai = new OpenAI({
  apiKey: env.SILICONFLOW_API_KEY,
  // 添加下面的属性，来使用openAI的兼容性api
  baseURL: 'https://api.siliconflow.com/v1',
});

// 构建消息历史，包含上一次的对话
const messages: ChatCompletionMessageParam[] = [
  { role: 'system', content: 'You are a helpful chat assistant.' },
  { role: 'user', content: 'Hello, tell me a joke.' },
];

/**
 * 支持多轮对话的 chat 函数
 * @param messages 对话历史数组（包括 system prompt）
 * @param options 可选参数：model, temperature 等
 * @returns 响应内容或 null
 */
export const chatWithHistory = async (
  prompt: string
): Promise<string | null> => {
  messages.push({ role: 'user', content: prompt });
  try {
    const completion = await openai.chat.completions.create({
      // model: "gpt-4o-mini",
      model: 'Qwen/Qwen3-8B',
      temperature: 0.4,
      max_tokens: 300,
      messages, // 支持传入历史消息，实现多轮
    });

    const response = completion.choices[0]?.message.content;
    if (response) {
      messages.push({ role: 'assistant', content: response });
    }
    return response ?? null;
  } catch (error) {
    console.error('SiliconFlow API error:', error);
    return null;
  }
};

export const chatOneTime = async (prompt: string) => {
  try {
    const completion = await openai.chat.completions.create({
      // model: "gpt-4o-mini",
      model: 'Qwen/Qwen3-8B',
      temperature: 0.4,
      max_tokens: 300,
      messages: [
        { role: 'system', content: 'You are a helpful chat assistant.' },
        { role: 'user', content: prompt },
      ],
    });
    return completion.choices[0]?.message.content;
  } catch (error) {
    console.error('call siliconflow error:', error);
    return null;
  }
};

// 新版openAI api，这种方案不支持其他模型的兼容，openAI现在不提供免费额度，暂时不用这个方案
// async (prompt: string) => {
//   const response = await openai.responses.create({
//     model: "gpt-4o-mini",
//     input: prompt,
//     max_output_tokens: 300,
//     temperature: 0.4,
//   });
//   return response.output_text;
// };
