import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
  // server 是内置的固定参数名,专门用于定义服务端环境变量的 schema
  server: {
    DB_PASSWORD: z.string().min(1),
    DB_HOST: z.string().min(1),
    DB_PORT: z.string().min(1),
    DB_USER: z.string().min(1),
    DB_NAME: z.string().min(1),
    ARCJET_KEY: z.string().min(1),
    CLERK_SECRET_KEY: z.string().min(1),
    HUME_API_KEY: z.string().min(1),
    HUME_SECRET_KEY: z.string().min(1),
    GEMINI_API_KEY: z.string().min(1),
  },
  // createFinalSchema 是内置的固定参数名,用于对合并后的 schema 进行最终处理和转换
  // 它的参数，都来自上面Server定义的schema
  // 转换后的值，也加入到 env 对象中
  createFinalSchema: (env) => {
    return z.object(env).transform((val) => {
      const { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER, ...rest } = val;
      return {
        ...rest,
        DATABASE_URL: `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}`,
      };
    });
  },
  // 内置参加，用于处理空字符串
  emptyStringAsUndefined: true,
  // 内置参数，用于提供实际的环境变量值的来源，这里process.env表示来自env环境变量
  experimental__runtimeEnv: process.env,
});

/*
完整工作流程
  1. 定义 Schema：server 参数定义哪些变量是必需的及其验证规则
  2. 获取值：experimental__runtimeEnv 提供实际的环境变量值
  3. 验证：根据 Zod schema 验证每个变量
  4. 转换空值：emptyStringAsUndefined 处理空字符串
  5. 后处理：createFinalSchema 进行最终转换和派生变量生成
*/
