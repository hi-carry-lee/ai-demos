"use client";

import { Button } from "@/components/ui/button";
import { env } from "@/data/env/client";
import { JobInfoTable } from "@/drizzle/schema";
import {
  createInterview,
  updateInterview,
} from "@/features/interviews/actions";
import { errorToast } from "@/lib/errorToast";
import { CondensedConversation } from "@/services/hume/components/CondensedMessages";
import { condenseChatHistory } from "@/services/hume/lib/condenseChatMessages";
import { useVoice, VoiceReadyState } from "@humeai/voice-react";
import { Loader2Icon, MicIcon, MicOffIcon, PhoneOffIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

// ! 为什么将这里的内容单独一个组件？
// ! 因为涉及到交互，需要作为 Client Component
export function StartCall({
  jobInfo,
  user,
  accessToken,
}: {
  accessToken: string;
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experienceLevel"
  >;
  user: { name: string; imageUrl: string };
}) {
  const { connect, readyState, chatMetadata, callDurationTimestamp } =
    useVoice();
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const durationRef = useRef(callDurationTimestamp);
  const router = useRouter();
  durationRef.current = callDurationTimestamp;

  // Sync chat ID
  // 会话元数据产生后，同步 humeChatId 到数据库（后续用于拉取完整对话并生成反馈）：
  useEffect(() => {
    if (chatMetadata?.chatId == null || interviewId == null) {
      return;
    }
    updateInterview({
      id: interviewId,
      data: { humeChatId: chatMetadata.chatId },
    });
  }, [chatMetadata?.chatId, interviewId]);

  // Sync duration 通话进行中，每 10 秒同步通话时长到 DB
  useEffect(() => {
    if (interviewId == null) return;
    const intervalId = setInterval(() => {
      if (durationRef.current == null) return;

      updateInterview({
        id: interviewId,
        data: { duration: durationRef.current },
      });
    }, 10000);

    return () => clearInterval(intervalId);
  }, [interviewId]);

  // Handle disconnect
  // 通话结束后：做一次时长同步，并路由到该面试详情页（若没拿到 interviewId，回列表页）：
  useEffect(() => {
    if (readyState !== VoiceReadyState.CLOSED) return;
    if (interviewId == null) {
      return router.push(`/app/job-infos/${jobInfo.id}/interviews`);
    }

    if (durationRef.current != null) {
      updateInterview({
        id: interviewId,
        data: { duration: durationRef.current },
      });
    }
    router.push(`/app/job-infos/${jobInfo.id}/interviews/${interviewId}`);
  }, [interviewId, readyState, router, jobInfo.id]);
  // TODO：上面三个useEffect适合抽取为三个独立的 custom hook

  // * IDLE状态，这里有开始面试按钮，连接Hume开始通话
  if (readyState === VoiceReadyState.IDLE) {
    return (
      <StartInverview
        jobInfo={jobInfo}
        user={user}
        accessToken={accessToken}
        setInterviewId={setInterviewId}
      />
    );
  }

  // *连接中或已关闭，显示加载中
  if (
    readyState === VoiceReadyState.CONNECTING ||
    readyState === VoiceReadyState.CLOSED
  ) {
    return (
      <div className="h-screen-header-link flex items-center justify-center">
        <Loader2Icon className="animate-spin size-24" />
      </div>
    );
  }

  // * 已连接，显示对话内容和控制按钮
  return (
    <div className="overflow-y-auto h-screen-header-link flex flex-col-reverse">
      <div className="container py-6 flex flex-col items-center justify-end gap-4">
        <Conversation user={user} />
        <Controls />
      </div>
    </div>
  );
}

function StartInverview({
  jobInfo,
  user,
  accessToken,
  setInterviewId,
}: {
  jobInfo: Pick<
    typeof JobInfoTable.$inferSelect,
    "id" | "title" | "description" | "experienceLevel"
  >;
  user: { name: string; imageUrl: string };
  accessToken: string;
  setInterviewId: (interviewId: string) => void;
}) {
  const { connect, callDurationTimestamp } = useVoice();
  const durationRef = useRef(callDurationTimestamp);
  durationRef.current = callDurationTimestamp;

  return (
    <div
      className="flex justify-center items-center"
      style={{ height: "calc(100% - 3rem)" }}
    >
      <Button
        size="lg"
        onClick={async () => {
          // 1. 点击开始面试按钮，想创建面试记录
          const res = await createInterview({ jobInfoId: jobInfo.id });
          if (res.error) {
            return errorToast(res.message);
          }
          // 2. 保存面试记录ID，
          setInterviewId(res.data.id);
          // 3. 开始连接Hume：connect是来自useVoice()钩子，提供需要的参数以连接Hume
          connect({
            auth: { type: "accessToken", value: accessToken },
            configId: env.NEXT_PUBLIC_HUME_CONFIG_ID,
            sessionSettings: {
              type: "session_settings",
              variables: {
                // 这些变量是在Hume的config中的Prompt里面使用的
                userName: user.name,
                title: jobInfo.title || "Not Specified",
                description: jobInfo.description,
                experienceLevel: jobInfo.experienceLevel,
              },
            },
          });
        }}
      >
        Start Interview
      </Button>
    </div>
  );
}

function Conversation({ user }: { user: { name: string; imageUrl: string } }) {
  // !useVoice可以实时获取到最新的对话数据，从而更新 messages的值
  // !进而触发 CondensedConversation 的更新
  const { messages, fft } = useVoice();

  const condensedMessages = useMemo(() => {
    return condenseChatHistory(messages);
  }, [messages]);

  return (
    <CondensedConversation
      messages={condensedMessages}
      user={user}
      maxFft={Math.max(...fft)}
      className="max-w-5xl"
    />
  );
}

// 通话控制按钮
function Controls() {
  const { disconnect, isMuted, mute, unmute, micFft, callDurationTimestamp } =
    useVoice();

  return (
    <div className="flex gap-5 rounded border px-5 py-2 w-fit sticky bottom-6 bg-background items-center">
      {/* 静音按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={() => (isMuted ? unmute() : mute())}
      >
        {isMuted ? <MicOffIcon className="text-destructive" /> : <MicIcon />}
        {/* 关于sr-only的说明：业界通用的 CSS 类名约定，用于隐藏文本，仅供屏幕阅读器使用，说明按钮当前状态 */}
        <span className="sr-only">{isMuted ? "Unmute" : "Mute"}</span>
      </Button>

      {/* 音量条 */}
      <div className="self-stretch">
        <FftVisualizer fft={micFft} />
      </div>

      {/* 通话时长 */}
      {/* 关于tabular-nums的说明：让数字以等宽字体显示，便于对齐，因为0和1的宽度是不同的，这样会导致布局跳动问题 */}
      <div className="text-sm text-muted-foreground tabular-nums">
        {callDurationTimestamp}
      </div>

      {/* 结束通话按钮 */}
      <Button
        variant="ghost"
        size="icon"
        className="-mx-3"
        onClick={disconnect}
      >
        <PhoneOffIcon className="text-destructive" />
        <span className="sr-only">End Call</span>
      </Button>
    </div>
  );
}

/*
! 这里实现了基本的音量条效果，更复杂的方式可以咨询AI
? FFT (Fast Fourier Transform - 快速傅里叶变换)： 
?   将音频信号从时域转换为频域
?   fft 数组中的每个数值代表特定频率范围的音量强度
*/
function FftVisualizer({ fft }: { fft: number[] }) {
  return (
    <div className="flex gap-1 items-center h-full">
      {fft.map((value, index) => {
        const percent = (value / 4) * 100;
        return (
          <div
            key={index}
            className="min-h-0.5 bg-primary/75 w-0.5 rounded"
            style={{ height: `${percent < 10 ? 0 : percent}%` }}
          />
        );
      })}
    </div>
  );
}
