import { JobInfoTable } from "@/drizzle/schema";
import { fetchChatMessages } from "../hume/lib/api";
import { generateText } from "ai";
import { google } from "./models/google";
import { createInterviewFeedbackSystemPrompt } from "./ai-prompt";

export async function generateAiInterviewFeedback({
  humeChatId,
  jobInfo,
  userName,
}: {
  humeChatId: string;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "description" | "experienceLevel"
  >;
  userName: string;
}) {
  // 它的类型是 ReturnChatEvent[]，所以message包含了 type, messageText, role, emotionFeatures等等
  const messages = await fetchChatMessages(humeChatId);

  const formattedMessages = messages
    .map((message) => {
      if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
        return null;
      }
      if (message.messageText == null) return null;

      return {
        speaker:
          message.type === "USER_MESSAGE" ? "interviewee" : "interviewer",
        text: message.messageText,
        // 如果是用户的话，才有emotionFeatures
        emotionFeatures:
          message.role === "USER" ? message.emotionFeatures : undefined,
      };
    })
    .filter((f) => f != null);

  const { text } = await generateText({
    model: google("gemini-2.5-flash"),
    // ?用户输入：包含实际的用户数据和具体问题
    prompt: JSON.stringify(formattedMessages),
    // ? 最大步骤：限制AI生成内容的最大推理步骤数
    maxSteps: 10,
    // ? 实验性功能，允许AI在需要时继续推理步骤
    experimental_continueSteps: true,
    // ? 系统指令：定义AI的角色、行为和处理方式
    system: createInterviewFeedbackSystemPrompt({
      userName,
      jobInfo: {
        title: jobInfo.title ?? "",
        description: jobInfo.description,
        experienceLevel: jobInfo.experienceLevel,
      },
    }),
  });

  return text;
}
