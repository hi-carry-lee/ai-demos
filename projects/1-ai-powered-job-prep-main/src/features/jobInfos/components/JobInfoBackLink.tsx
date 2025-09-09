import { BackLink } from "@/components/BackLink";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { cn } from "@/lib/utils";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { Suspense } from "react";
import { getJobInfoIdTag } from "../dbCache";

/*
 * 组件设计分析
 * 1. 为什么传入 jobInfoId 而不是 jobInfo 对象？
 *   因为考虑的是复用该组件，且有些场景下，传入jobInfo可能会跨组件传递，增加组件的复杂度
 *   而cache的时候，使得该相同jobInfoId的组件，可以共用同一个缓存，提高性能
 */
export function JobInfoBackLink({
  jobInfoId,
  className,
}: {
  jobInfoId: string;
  className?: string;
}) {
  return (
    <BackLink
      href={`/app/job-infos/${jobInfoId}`}
      className={cn("mb-4", className)}
    >
      <Suspense fallback="Job Description">
        <JobName jobInfoId={jobInfoId} />
      </Suspense>
    </BackLink>
  );
}

async function JobName({ jobInfoId }: { jobInfoId: string }) {
  const jobInfo = await getJobInfo(jobInfoId);
  return jobInfo?.name ?? "Job Description";
}

async function getJobInfo(id: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: eq(JobInfoTable.id, id),
  });
}
