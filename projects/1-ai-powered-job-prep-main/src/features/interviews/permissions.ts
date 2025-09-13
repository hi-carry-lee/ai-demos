import { db } from "@/drizzle/db";
import { InterviewTable, JobInfoTable } from "@/drizzle/schema";
import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { hasPermission } from "@/services/clerk/lib/hasPermission";
import { and, count, eq, isNotNull } from "drizzle-orm";

/*
 * 1. Promise.any的解析
 *   内部支持多个Promise的执行，有任一Promise fullfilled(包含resolve和reject)，则返回该Promise的值
 *   如果所有Promise都rejected，才会抛出 AggregateError异常， 被catch捕获，同样返回false（自动包装为promise）
 * 2. (bool) => bool || Promise.reject() 的解析
 *    或运算，第一个为true，则直接返回，否则执行第二个，因为它是 fullfilled（Promise.reject()是fullfilled的一种）
 *    如果是bool的话，那么它会被包装为 promise
 */
export async function canCreateInterview() {
  return await Promise.any([
    // ? 优先检查是否有无限次数的权限
    hasPermission("unlimited_interviews").then(
      (bool) => bool || Promise.reject()
    ),
    // ? 检查是否有1次面试的权限，并且用户没有超过1次面试
    Promise.all([hasPermission("1_interview"), getUserInterviewCount()]).then(
      ([has, c]) => {
        if (has && c < 1) return true;
        return Promise.reject();
      }
    ),
  ]).catch(() => false);
}

// ? 下面两个函数不需要cache，因为数据经常变化，需要实时获取
async function getUserInterviewCount() {
  const { userId } = await getCurrentUser();
  if (userId == null) return 0;

  return getInterviewCount(userId);
}

async function getInterviewCount(userId: string) {
  const [{ count: c }] = await db
    .select({ count: count() })
    .from(InterviewTable)
    .innerJoin(JobInfoTable, eq(InterviewTable.jobInfoId, JobInfoTable.id))
    .where(
      and(eq(JobInfoTable.userId, userId), isNotNull(InterviewTable.humeChatId))
    );

  return c;
}
