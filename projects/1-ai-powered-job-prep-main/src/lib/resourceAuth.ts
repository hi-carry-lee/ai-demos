import { db } from "@/drizzle/db";
import { and, eq } from "drizzle-orm";
import { JobInfoTable, InterviewTable } from "@/drizzle/schema";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { getInterviewIdTag } from "@/features/interviews/dbCache";

/**
 * 验证用户对JobInfo的访问权限
 */
export async function verifyJobInfoAccess(jobInfoId: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(jobInfoId));

  const jobInfo = await db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, jobInfoId), eq(JobInfoTable.userId, userId)),
  });

  return jobInfo;
}

/**
 * 验证用户对Interview的访问权限
 */
export async function verifyInterviewAccess(
  interviewId: string,
  userId: string
) {
  "use cache";
  cacheTag(getInterviewIdTag(interviewId));

  const interview = await db.query.InterviewTable.findFirst({
    where: eq(InterviewTable.id, interviewId),
    with: {
      jobInfo: {
        columns: {
          id: true,
          userId: true,
          description: true,
          title: true,
          experienceLevel: true,
        },
      },
    },
  });

  if (interview == null) return null;

  cacheTag(getJobInfoIdTag(interview.jobInfo.id));
  if (interview.jobInfo.userId !== userId) return null;

  return interview;
}
