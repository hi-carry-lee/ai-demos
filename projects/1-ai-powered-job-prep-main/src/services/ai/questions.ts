import {
  JobInfoTable,
  QuestionDifficulty,
  QuestionTable,
} from "@/drizzle/schema";
import { CoreMessage, streamText } from "ai";
import { google } from "./models/google";
import {
  createQuestionFeedbackSystemPrompt,
  createQuestionGenerationSystemPrompt,
} from "./ai-prompt";

export function generateAiQuestion({
  jobInfo,
  previousQuestions,
  difficulty,
  onFinish,
}: {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "title" | "description" | "experienceLevel"
  >;
  previousQuestions: Pick<
    typeof QuestionTable.$inferSelect,
    "text" | "difficulty"
  >[];
  difficulty: QuestionDifficulty;
  onFinish: (question: string) => void;
}) {
  const previousMessages = previousQuestions.flatMap(
    (q) =>
      [
        { role: "user", content: q.difficulty },
        { role: "assistant", content: q.text },
      ] satisfies CoreMessage[]
  );

  return streamText({
    model: google("gemini-2.5-flash"),
    onFinish: ({ text }) => onFinish(text),
    // prompt
    messages: [
      // 发送之前的会话，这点很重要，起码可以避免重复
      ...previousMessages,
      {
        role: "user",
        content: difficulty,
      },
    ],
    maxSteps: 10,
    experimental_continueSteps: true,
    // 系统指令
    system: createQuestionGenerationSystemPrompt({
      jobInfo: {
        title: jobInfo.title ?? "",
        description: jobInfo.description,
        experienceLevel: jobInfo.experienceLevel,
      },
    }),
  });
}

export function generateAiQuestionFeedback({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) {
  return streamText({
    model: google("gemini-2.5-flash"),
    prompt: answer,
    maxSteps: 10,
    experimental_continueSteps: true,
    system: createQuestionFeedbackSystemPrompt({
      question,
    }),
  });
}
