import { JobInfoTable } from "@/drizzle/schema";
import { streamObject } from "ai";
import { google } from "../models/google";
import { aiAnalyzeSchema } from "./schemas";
import { createResumeAnalysisSystemPrompt } from "../ai-prompt";

export async function analyzeResumeForJob({
  resumeFile,
  jobInfo,
}: {
  resumeFile: File;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "experienceLevel" | "description"
  >;
}) {
  // * 流式结构化对象生成
  return streamObject({
    model: google("gemini-2.5-flash"),
    // 必须是一个Zod schema，但是它的具体属性，根据业务需要去定义
    schema: aiAnalyzeSchema,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "file",
            // 直接传递文件，而不是提取文件，因为模型支持多模态，
            // 而直接传递文件，还不会丢失格式信息
            data: await resumeFile.arrayBuffer(),
            mimeType: resumeFile.type,
          },
        ],
      },
    ],
    system: createResumeAnalysisSystemPrompt({
      jobInfo: {
        title: jobInfo.title ?? "",
        description: jobInfo.description,
        experienceLevel: jobInfo.experienceLevel,
      },
    }),
  });
}
