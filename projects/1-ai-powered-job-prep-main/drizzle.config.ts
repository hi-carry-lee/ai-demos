import { env } from "@/data/env/server";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // 指定数据库迁移文件的输出目录
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema.ts",
  // 告诉 Drizzle 使用 PostgreSQL 特定的 SQL 语法
  dialect: "postgresql",
  // 数据库连接配置
  dbCredentials: {
    url: env.DATABASE_URL,
  },
});
