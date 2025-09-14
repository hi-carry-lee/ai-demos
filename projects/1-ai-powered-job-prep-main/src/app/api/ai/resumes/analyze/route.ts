import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { allowedTypes } from "@/features/resumeAnalyses/constants";
import { canRunResumeAnalysis } from "@/features/resumeAnalyses/permissions";
import { PLAN_LIMIT_MESSAGE } from "@/lib/errorToast";
import { analyzeResumeForJob } from "@/services/ai/resumes/ai";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function POST(req: Request) {
  // * ------------------------------->校验开始<------------------------------
  const { userId } = await getCurrentUser();

  if (userId == null) {
    return new Response("You are not logged in", { status: 401 });
  }

  const formData = await req.formData();
  const resumeFile = formData.get("resumeFile") as File;
  const jobInfoId = formData.get("jobInfoId") as string;

  if (!resumeFile || !jobInfoId) {
    return new Response("Invalid request", { status: 400 });
  }

  if (resumeFile.size > 10 * 1024 * 1024) {
    return new Response("File size exceeds 10MB limit", { status: 400 });
  }

  if (!allowedTypes.includes(resumeFile.type)) {
    return new Response("Please upload a PDF, Word document, or text file", {
      status: 400,
    });
  }

  const jobInfo = await getJobInfo(jobInfoId, userId);
  if (jobInfo == null) {
    return new Response("You do not have permission to do this", {
      status: 403,
    });
  }

  if (!(await canRunResumeAnalysis())) {
    return new Response(PLAN_LIMIT_MESSAGE, { status: 403 });
  }
  // 上面很多的异步操作，咨询AI说并行执行的优化，收益不大，还要处理clerk的竟态问题
  // * ------------------------------->校验结束<------------------------------

  const res = await analyzeResumeForJob({
    resumeFile,
    jobInfo,
  });

  return res.toTextStreamResponse();
}

async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
