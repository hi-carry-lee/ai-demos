import { BackLink } from "@/components/BackLink";
import { Skeleton } from "@/components/Skeleton";
import { SuspendedItem } from "@/components/SuspendedItem";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/drizzle/db";
import { JobInfoTable } from "@/drizzle/schema";
import { getJobInfoIdTag } from "@/features/jobInfos/dbCache";
import { formatExperienceLevel } from "@/features/jobInfos/lib/formatters";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { and, eq } from "drizzle-orm";
import { ArrowRightIcon } from "lucide-react";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import Link from "next/link";
import { notFound } from "next/navigation";
import { options } from "@/features/interviews/constants";

export default async function JobInfoPage({
  params,
}: {
  params: Promise<{ jobInfoId: string }>;
}) {
  const { jobInfoId } = await params;

  // 这里的jobInfo是一个 Promise
  const jobInfo = getCurrentUser().then(
    async ({ userId, redirectToSignIn }) => {
      if (userId == null) return redirectToSignIn();

      const jobInfo = await getJobInfo(jobInfoId, userId);
      if (jobInfo == null) return notFound();
      // then 返回的 Promise 会以 v 作为完成值
      return jobInfo;
    }
  );

  /*
  ! 这里使用多个 SuspendedItem 属于过渡设计，每个Suspense都会生成suspense bundary,对性能有轻微影响
  ! 多个 SuspendedItem 最佳的使用场景是多个数据源，
*/
  return (
    <section className="container my-4 space-y-4">
      <BackLink href="/app">Dashboard</BackLink>

      <div className="space-y-6">
        {/* 展示job详情 */}
        <header className="space-y-4">
          <div className="space-y-2">
            {/* title */}
            <h1 className="text-3xl md:text-4xl">
              <SuspendedItem
                item={jobInfo}
                // 通过 w-48 来控制 Skeleton 的宽度
                fallback={<Skeleton className="w-48" />}
                result={(j) => j.name}
              />
            </h1>
            {/* badge */}
            <div className="flex gap-2">
              <SuspendedItem
                item={jobInfo}
                // 通过 w-12 来控制 Skeleton 的宽度
                fallback={<Skeleton className="w-12" />}
                result={(j) => (
                  <Badge variant="secondary">
                    {formatExperienceLevel(j.experienceLevel)}
                  </Badge>
                )}
              />
              <SuspendedItem
                item={jobInfo}
                fallback={null}
                result={(j) => {
                  return (
                    j.title && <Badge variant="secondary">{j.title}</Badge>
                  );
                }}
              />
            </div>
          </div>
          {/* description */}
          <p className="text-muted-foreground line-clamp-3">
            <SuspendedItem
              item={jobInfo}
              fallback={<Skeleton className="w-96" />}
              result={(j) => j.description}
            />
          </p>
        </header>

        {/* 跳转Interview，questions，resume，edit4个页面 */}
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-6 has-hover:*:not-hover:opacity-70">
          {options.map((option) => (
            <li
              key={option.href}
              className="list-none hover:scale-[1.02] transition-[transform_opacity]"
            >
              <Link href={`/app/job-infos/${jobInfoId}/${option.href}`}>
                <Card className="h-full flex items-center justify-between flex-row">
                  <CardHeader className="flex-grow">
                    <CardTitle>{option.label}</CardTitle>
                    <CardDescription>{option.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ArrowRightIcon className="size-6" />
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// TODO：将这个函数放在action文件中导出，同样可以实现页面级的缓存
async function getJobInfo(id: string, userId: string) {
  "use cache";
  cacheTag(getJobInfoIdTag(id));

  return db.query.JobInfoTable.findFirst({
    where: and(eq(JobInfoTable.id, id), eq(JobInfoTable.userId, userId)),
  });
}
