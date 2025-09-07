import { db } from "@/drizzle/db";
import { UserTable } from "@/drizzle/schema";
import { getUserIdTag } from "@/features/users/dbCache";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

export async function getCurrentUser({ allData = false } = {}) {
  const { userId, redirectToSignIn } = await auth();

  return {
    userId,
    redirectToSignIn, // 将用户重定向到登录页面的函数
    // ! allData是false时，则只返回userId
    user: allData && userId != null ? await getUser(userId) : undefined,
  };
}

// ! 注意这个函数，只被上面的函数调用，因为它没有 export
// getCurrentUser 被Onboarding组件调用，它是服务器组件
// 另外一个 getUser被client组件调用，它需要使用 'use server'来表示它是Server action
async function getUser(id: string) {
  "use cache";
  cacheTag(getUserIdTag(id));

  return db.query.UserTable.findFirst({
    where: eq(UserTable.id, id),
  });
}
