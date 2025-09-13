"use server";

import { withAuthInterview, withAuthInterviewNoParam } from "@/lib/auth";
import { verifyJobInfoAccess, verifyInterviewAccess } from "@/lib/resourceAuth";
import { insertInterview, updateInterview as updateInterviewDb } from "./db";
import { canCreateInterview } from "./permissions";
import { PLAN_LIMIT_MESSAGE, RATE_LIMIT_MESSAGE } from "@/lib/errorToast";
import { env } from "@/data/env/server";
import arcjet, { tokenBucket, request } from "@arcjet/next";
import { generateAiInterviewFeedback } from "@/services/ai/interviews";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";

// ? 创建面试的速率限制
const aj = arcjet({
  characteristics: ["userId"],
  key: env.ARCJET_KEY,
  rules: [
    // 使用令牌桶算法，每1天填充4个令牌，最多12个令牌
    tokenBucket({
      capacity: 12,
      refillRate: 4,
      interval: "1d",
      mode: "LIVE",
    }),
  ],
});

export const createInterview = withAuthInterview(
  async (userId, { jobInfoId }: { jobInfoId: string }) => {
    if (!(await canCreateInterview())) {
      throw new Error(PLAN_LIMIT_MESSAGE);
    }

    // requested: 1 表示每次请求消耗1个令牌
    const decision = await aj.protect(await request(), {
      userId,
      requested: 1,
    });

    if (decision.isDenied()) {
      throw new Error(RATE_LIMIT_MESSAGE);
    }

    const jobInfo = await verifyJobInfoAccess(jobInfoId, userId);
    if (jobInfo == null) {
      throw new Error("You don't have permission to do this");
    }

    const interview = await insertInterview({
      jobInfoId,
      duration: "00:00:00",
    });
    return { error: false, data: { id: interview.id } };
  }
);

export const updateInterview = withAuthInterview(
  async (
    userId,
    {
      id,
      data,
    }: {
      id: string;
      data: { humeChatId?: string; duration?: string };
    }
  ) => {
    const interview = await verifyInterviewAccess(id, userId);
    if (interview == null) {
      throw new Error("You don't have permission to do this");
    }

    await updateInterviewDb(id, data);
    return { error: false, data: { success: true } };
  }
);

// 生成面试反馈：拿到 humeChatId 后，从 Hume 拉取会话消息，喂给 Gemini 生成 Markdown 反馈
export const generateInterviewFeedback = withAuthInterviewNoParam(
  async (userId, interviewId: string) => {
    const { user } = await getCurrentUser({ allData: true });
    if (user == null) {
      throw new Error("User data not available");
    }

    const interview = await verifyInterviewAccess(interviewId, userId);
    if (interview == null) {
      throw new Error("You don't have permission to do this");
    }

    if (interview.humeChatId == null) {
      throw new Error("Interview has not been completed yet");
    }

    const feedback = await generateAiInterviewFeedback({
      humeChatId: interview.humeChatId,
      jobInfo: interview.jobInfo,
      userName: user.name,
    });

    if (feedback == null) {
      throw new Error("Failed to generate feedback");
    }

    await updateInterviewDb(interviewId, { feedback });
    return { error: false, data: { success: true } };
  }
);
