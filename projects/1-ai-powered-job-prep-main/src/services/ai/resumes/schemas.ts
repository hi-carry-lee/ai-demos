import z from "zod";

// 定义了每个评估维度的通用结构：
// score: 1-10分评分
// summary: 简短总结
// feedback: 具体反馈数组
const categorySchema = z.object({
  score: z.number().min(0).max(10).describe("Score of the category from 1-10"),
  summary: z.string().describe("Short summary of the category"),
  feedback: z
    .array(
      z.object({
        type: z.enum(["strength", "minor-improvement", "major-improvement"]),
        name: z.string().describe("Name of the feedback"),
        message: z.string().describe("Description of the feedback"),
      })
    )
    .describe("Specific feedback on positives and negatives"),
});

export const aiAnalyzeSchema = z.object({
  overallScore: z
    .number()
    .min(0)
    .max(10)
    .describe("Overall score of the resume"),
  // describe() 是 Zod 的内置方法，用于给 schema 添加描述信息
  // 代码解释：categorySchema就是ats的类型，然后用 describe()方法，再给ats添加描述信息
  // describe()方法返回的依然是schema，只是添加了描述信息
  // 源码中：describe(description: string): this; 返回this，即schema本身
  ats: categorySchema.describe(
    "Analysis of how well the resume matches ATS requirements"
  ),
  jobMatch: categorySchema.describe(
    "Analysis of how well the resume matches the job requirements"
  ),
  writingAndFormatting: categorySchema.describe(
    "Analysis of the writing quality and formatting of the resume (taking into account the job requirements)"
  ),
  keywordCoverage: categorySchema.describe(
    "Analysis of the keyword coverage in the resume (taking into account the job requirements)"
  ),
  other: categorySchema.describe(
    "Any other relevant analysis not covered by the above categories"
  ),
});
