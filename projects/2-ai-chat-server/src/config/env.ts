import dotenv from "dotenv";
// import like this is the recommended way to use zod
import { z } from "zod";

// 加载.env文件
dotenv.config();

// Define environment schema
const envSchema = z.object({
  PORT: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().min(1).max(65535)),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  OPENAI_API_KEY: z.string().optional(),
  SILICONFLOW_API_KEY: z.string().min(1, "SILICONFLOW_API_KEY is required"),
  // Add GEMINI_API_KEY if you use it
  GEMINI_API_KEY: z.string().min(1, "GEMINI_API_KEY is required"),
});

// Parse and validate environment variables
const parseResult = envSchema.safeParse(process.env);

if (!parseResult.success) {
  parseResult.error.errors.forEach((error) => {
    console.error(`  - ${error.path.join(".")}: ${error.message}`);
  });
  process.exit(1);
}

export const env = parseResult.data;
