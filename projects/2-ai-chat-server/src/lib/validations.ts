import type { Conversation } from '@prisma/client';
import z from 'zod';

// CUID 验证函数
const cuidSchema = z
  .string()
  .min(1, 'ID is required')
  .regex(/^c[a-z0-9]{24}$/, 'Invalid ID format');

// 现有的聊天请求 schema
export const chatRequestSchema = z.object({
  message: z
    .string()
    .trim()
    .min(1, 'message is required')
    .max(1000, 'message is too long'),
  conversationId: cuidSchema,
});

// 用户相关 schema
export const registerUserSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name is too long'),
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(100, 'Password is too long'),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email format').max(255, 'Email is too long'),
  password: z
    .string()
    .min(1, 'Password is required')
    .max(100, 'Password is too long'),
});

export const userSchema = z.object({
  id: cuidSchema,
  name: z.string(),
  email: z.string().email(),
  password: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// 消息相关 schema
export const createMessageSchema = z.object({
  conversationId: cuidSchema,
  role: z.enum(['user', 'model']),
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(300, 'Content is too long'),
});

export const updateMessageSchema = z.object({
  content: z
    .string()
    .trim()
    .min(1, 'Content is required')
    .max(10000, 'Content is too long'),
});

// 会话相关 schema
export const createConversationSchema = z.object({
  userId: cuidSchema,
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long'),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model name is too long'),
  status: z
    .enum(['active', 'archived', 'deleted'])
    .optional()
    .default('active'),
});

export const updateConversationSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(200, 'Title is too long')
    .optional(),
  status: z.enum(['active', 'archived', 'deleted']).optional(),
  model: z
    .string()
    .min(1, 'Model is required')
    .max(50, 'Model name is too long')
    .optional(),
});

// 使用 lazy 定义循环引用的 schema
export const messageSchema = z.object({
  id: cuidSchema,
  conversationId: cuidSchema,
  role: z.enum(['user', 'model']),
  content: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  conversation: z.lazy(() => conversationSchema).optional(),
});

export const conversationSchema: z.ZodType<Conversation> = z.object({
  id: cuidSchema,
  userId: cuidSchema,
  title: z.string(),
  status: z.enum(['active', 'archived', 'deleted']),
  model: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  user: userSchema.omit({ password: true }).optional(),
  messages: z.array(z.lazy(() => messageSchema)).optional(),
});

// 认证结果 schema
export const authResultSchema = z.object({
  success: z.boolean(),
  user: userSchema.omit({ password: true }).optional(),
  token: z.string().optional(),
  error: z.string().optional(),
});

// 查询参数验证 schema
export const paginationQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 1))
    .refine(val => val > 0, 'Page must be greater than 0'),
  limit: z
    .string()
    .optional()
    .transform(val => (val ? parseInt(val, 10) : 20))
    .refine(val => val > 0 && val <= 100, 'Limit must be between 1 and 100'),
});

export const conversationIdParamSchema = z.object({
  id: cuidSchema,
});

export const messageIdParamSchema = z.object({
  id: cuidSchema,
});

export const conversationIdParamSchemaForMessages = z.object({
  conversationId: cuidSchema,
});

// 类型推断 - 从 schema 推断 TypeScript 类型
export type RegisterUserInput = z.infer<typeof registerUserSchema>;
export type LoginUserInput = z.infer<typeof loginUserSchema>;
export type CreateConversationInput = z.infer<typeof createConversationSchema>;
export type UpdateConversationInput = z.infer<typeof updateConversationSchema>;
export type CreateMessageInput = z.infer<typeof createMessageSchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type AuthResultInput = z.infer<typeof authResultSchema>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
