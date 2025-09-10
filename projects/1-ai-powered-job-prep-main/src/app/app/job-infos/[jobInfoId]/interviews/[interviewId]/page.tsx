import { BackLink } from "@/components/BackLink";
import { Skeleton, SkeletonButton } from "@/components/Skeleton";
import { SuspendedItem } from "@/components/SuspendedItem";
import { Button } from "@/components/ui/button";
import { db } from "@/drizzle/db";
import { InterviewTable } from "@/drizzle/schema";
import { getInterviewIdTag } from "@/features/interviews/dbCache";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { formatDateTime } from "@/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { notFound } from "next/navigation";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Loader2Icon } from "lucide-react";
import { Suspense } from "react";
import { CondensedConversation } from "@/services/hume/components/CondensedMessages";
import { condenseChatHistory } from "@/services/hume/lib/condenseChatMessages";
import { fetchChatMessages } from "@/services/hume/lib/api";
import { ActionButton } from "@/components/ui/action-button";
import { generateInterviewFeedback } from "@/features/interviews/actions";

// ! 面试详情页
export default async function InterviewPage({
  params,
}: {
  params: Promise<{ jobInfoId: string; interviewId: string }>;
}) {
  const { jobInfoId, interviewId } = await params;

  // ? 查询具体的面试
  const interview = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const interview = await getInterview(interviewId, userId);
      if (interview == null) return notFound();
      return interview;
    }
  );

  return (
    <div className="container my-4 space-y-4">
      <BackLink href={`/app/job-infos/${jobInfoId}/interviews`}>
        All Interviews
      </BackLink>

      <div className="space-y-6">
        <header className="flex gap-2 justify-between">
          <div className="space-y-2 mb-6">
            <h1 className="text-3xl md:text-4xl">
              Interview:
              <SuspendedItem
                // ! 同一个数据源，多个 SuspendedItem 属于过渡设计，对性能有轻微影响，但是这样可以复用 Skeleton 组件，这属于trade-off，
                item={interview}
                fallback={<Skeleton className="w-48" />}
                result={(i) => formatDateTime(i.createdAt)}
              />
            </h1>
            <p className="text-muted-foreground">
              <SuspendedItem
                item={interview}
                fallback={<Skeleton className="w-24" />}
                result={(i) => i.duration}
              />
            </p>
          </div>
          <SuspendedItem
            item={interview}
            fallback={<SkeletonButton className="w-32" />}
            result={(i) => <InterviewFeedbackActions interview={i} />}
          />
        </header>

        <Suspense
          fallback={<Loader2Icon className="animate-spin size-24 mx-auto" />}
        >
          <InterviewConversation interview={interview} />
        </Suspense>
      </div>
    </div>
  );
}

// ! 面试反馈
function InterviewFeedbackActions({
  interview,
}: {
  // ?另外一种获取类型的方式：interview: InferSelectModel<typeof InterviewTable>;
  // 但是它相对复杂，推荐使用下面的方式
  interview: typeof InterviewTable.$inferSelect;
}) {
  if (interview.feedback == null) {
    return (
      <ActionButton action={generateInterviewFeedback.bind(null, interview.id)}>
        Generate Feedback
      </ActionButton>
    );
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>View Feedback</Button>
      </DialogTrigger>
      <DialogContent className="md:max-w-3xl lg:max-w-4xl max-h-[calc(100%-2rem)] overflow-y-auto flex flex-col">
        <DialogTitle>Feedback</DialogTitle>
        <MarkdownRenderer>{interview.feedback}</MarkdownRenderer>
      </DialogContent>
    </Dialog>
  );
}

// ! 面试对话
async function InterviewConversation({
  interview,
}: {
  interview: Promise<{ humeChatId: string | null }>;
}) {
  const { user, redirectToSignIn } = await getCurrentUser({ allData: true });
  if (user == null) return redirectToSignIn();
  const { humeChatId } = await interview;
  if (humeChatId == null) return notFound();

  const condensedChats = condenseChatHistory(
    await fetchChatMessages(humeChatId)
  );

  return (
    <CondensedConversation
      messages={condensedChats}
      user={user}
      className="max-w-5xl mx-auto"
    />
  );
}

async function getInterview(id: string, userId: string) {
  "use cache";
  cacheTag(getInterviewIdTag(id));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, id),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}
