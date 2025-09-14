"use client";

import { BackLink } from "@/components/BackLink";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Button } from "@/components/ui/button";
import { LoadingSwap } from "@/components/ui/loading-swap";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import {
  JobInfoTable,
  questionDifficulties,
  QuestionDifficulty,
} from "@/drizzle/schema";
import { formatQuestionDifficulty } from "@/features/questions/formatters";
import { useMemo, useState } from "react";
import { useCompletion } from "@ai-sdk/react";
import { errorToast } from "@/lib/errorToast";
import z from "zod";

type Status = "awaiting-answer" | "awaiting-difficulty" | "init";

export function NewQuestionClientPage({
  jobInfo,
}: {
  jobInfo: Pick<typeof JobInfoTable.$inferSelect, "id" | "name" | "title">;
}) {
  const [status, setStatus] = useState<Status>("init");
  const [answer, setAnswer] = useState<string | null>(null);

  // * ------------------------------->AI生成问题<------------------------------
  const {
    complete: generateQuestion, // 触发 AI 生成的函数，通过用户点击难度按钮触发
    completion: question, // 生成的内容
    setCompletion: setQuestion, // 设置生成的内容
    isLoading: isGeneratingQuestion,
    data, // 服务器返回的结构化数据
  } = useCompletion({
    // 用户点击难度按钮，触发 AI 生成问题，会先调用这个api
    api: "/api/ai/questions/generate-question",
    onFinish: () => {
      setStatus("awaiting-answer");
    },
    onError: (error) => {
      errorToast(error.message);
    },
  });

  // * ------------------------------->AI生成反馈<------------------------------
  const {
    complete: generateFeedback,
    completion: feedback,
    setCompletion: setFeedback,
    isLoading: isGeneratingFeedback,
  } = useCompletion({
    api: "/api/ai/questions/generate-feedback",
    onFinish: () => {
      setStatus("awaiting-difficulty");
    },
    onError: (error) => {
      errorToast(error.message);
    },
  });

  // 使用useMemo避免每次组件渲染都重新解析数据，只有当 data 发生变化时才重新计算 qu
  const questionId = useMemo(() => {
    // 通过at(-1)获取最新的问题，这只是一个防御性编程；
    const item = data?.at(-1);
    // 使用 Zod schema 验证数据是否包含有效的 questionId 字段
    if (item == null) return null;
    const parsed = z.object({ questionId: z.string() }).safeParse(item);
    if (!parsed.success) return null;

    return parsed.data.questionId;
  }, [data]);

  return (
    <div className="flex flex-col items-center gap-4 w-full mx-w-[2000px] mx-auto flex-grow h-screen-header">
      {/* 菜单栏 */}
      <div className="container flex gap-4 mt-4 items-center justify-between">
        {/* 返回按钮 */}
        <div className="flex-grow basis-0">
          <BackLink href={`/app/job-infos/${jobInfo.id}`}>
            {jobInfo.name}
          </BackLink>
        </div>

        {/* 控制栏 */}
        <Controls
          // 给 skip 按钮使用的
          reset={() => {
            setStatus("init");
            setQuestion("");
            setFeedback("");
            setAnswer(null);
          }}
          // 是否禁用 answer 按钮
          disableAnswerButton={
            answer == null || answer.trim() === "" || questionId == null
          }
          status={status}
          isLoading={isGeneratingFeedback || isGeneratingQuestion}
          generateFeedback={() => {
            if (answer == null || answer.trim() === "" || questionId == null)
              return;

            generateFeedback(answer?.trim(), { body: { questionId } });
          }}
          generateQuestion={(difficulty) => {
            setQuestion("");
            setFeedback("");
            setAnswer(null);
            generateQuestion(difficulty, { body: { jobInfoId: jobInfo.id } });
          }}
        />
        {/** 
          想要实现的效果：✅✅✅✅
            小屏幕上，返回按钮和三个难度按钮按照space-between排列
            大屏幕上，返回按钮在最左，三个难度按钮居中
          容器是flex布局，利用 flex-grow hidden md:block实现，
            小屏幕它不显示，其他两个都是flex-gorw
            大屏幕的时候，三个都是flex-grow，会平分整个宽度，正好让三个难度按钮居中
        */}
        <div className="flex-grow hidden md:block" />
      </div>

      {/* 问题容器 */}
      <QuestionAnswerContainer
        question={question}
        feedback={feedback}
        answer={answer}
        status={status}
        setAnswer={setAnswer}
      />
    </div>
  );
}

function Controls({
  status,
  isLoading,
  disableAnswerButton,
  generateQuestion,
  generateFeedback,
  reset,
}: {
  disableAnswerButton: boolean;
  status: Status;
  isLoading: boolean;
  generateQuestion: (difficulty: QuestionDifficulty) => void;
  generateFeedback: () => void;
  reset: () => void;
}) {
  return (
    <div className="flex gap-2">
      {status === "awaiting-answer" ? (
        <>
          <Button
            onClick={reset}
            disabled={isLoading}
            variant="outline"
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Skip</LoadingSwap>
          </Button>
          <Button
            onClick={generateFeedback}
            disabled={disableAnswerButton}
            size="sm"
          >
            <LoadingSwap isLoading={isLoading}>Answer</LoadingSwap>
          </Button>
        </>
      ) : (
        // * 生成难度选择按钮组
        questionDifficulties.map((difficulty) => (
          <Button
            key={difficulty}
            size="sm"
            disabled={isLoading}
            onClick={() => generateQuestion(difficulty)}
          >
            <LoadingSwap isLoading={isLoading}>
              {formatQuestionDifficulty(difficulty)}
            </LoadingSwap>
          </Button>
        ))
      )}
    </div>
  );
}

function QuestionAnswerContainer({
  question,
  feedback,
  answer,
  status,
  setAnswer,
}: {
  question: string | null; // 比如传值，要么string，要么null，不会是undefined
  // question?: string; 可以不传，默认值是null，
  feedback: string | null;
  answer: string | null;
  status: Status;
  setAnswer: (value: string) => void;
}) {
  return (
    <ResizablePanelGroup direction="horizontal" className="flex-grow border-t">
      {/* 问题和反馈容器 */}
      <ResizablePanel id="question-and-feedback" defaultSize={50} minSize={5}>
        <ResizablePanelGroup direction="vertical" className="flex-grow">
          <ResizablePanel id="question" defaultSize={25} minSize={5}>
            <ScrollArea className="h-full min-w-48 *:h-full">
              {status === "init" && question == null ? (
                <p className="text-base md:text-lg flex items-center justify-center h-full p-6">
                  Get started by selecting a question difficulty above.
                </p>
              ) : (
                question && (
                  <MarkdownRenderer className="p-6">
                    {question}
                  </MarkdownRenderer>
                )
              )}
            </ScrollArea>
          </ResizablePanel>
          {feedback && (
            <>
              {/* 在两个panel之间添加一个分割线，只有当有feedback的时候才显示 */}
              <ResizableHandle withHandle />
              <ResizablePanel id="feedback" defaultSize={75} minSize={5}>
                {/* 通用选择器修饰符，*:h-full：给所有直接子元素设置 height: 100% */}
                <ScrollArea className="h-full min-w-48 *:h-full">
                  <MarkdownRenderer className="p-6">
                    {feedback}
                  </MarkdownRenderer>
                </ScrollArea>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>

      {/* 在两个panel之间添加一个分割线 */}
      <ResizableHandle withHandle />

      {/* 答案容器 */}
      <ResizablePanel id="answer" defaultSize={50} minSize={5}>
        <ScrollArea className="h-full min-w-48 *:h-full">
          <Textarea
            disabled={status !== "awaiting-answer"}
            onChange={(e) => setAnswer(e.target.value)}
            value={answer ?? ""}
            placeholder="Type your answer here..."
            // * resize-none：禁用 textarea 的 resize，以使用Resizable的resize功能；
            // * !text-base：确保字体不会被其他字体样式覆盖
            className="w-full h-full resize-none border-none rounded-none focus-visible:ring focus-visible:ring-inset !text-base p-6"
          />
        </ScrollArea>
      </ResizablePanel>
    </ResizablePanelGroup>
  );
}
