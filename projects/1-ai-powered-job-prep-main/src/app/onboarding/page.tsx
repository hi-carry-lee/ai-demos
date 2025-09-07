import { getCurrentUser } from "@/services/clerk/lib/getCurrentUser";
import { redirect } from "next/navigation";
import { OnboardingClient } from "./_client";

/*
 * 流程说明：
      用户登录/注册 → Clerk认证成功 → 获得userId → 
      来到onboarding等待页面 → 调用getCurrentUser → 
      等待Clerk webhook同步数据到本地数据库
 */
export default async function OnboardingPage() {
  // 用户注册登录后，通过Clerk的auth()，很容易获取userId，
  // 但是我们还想获取完整的用户信息，因此需要调用getCurrentUser，获取 user
  const { userId, user } = await getCurrentUser({ allData: true });

  if (userId == null) return redirect("/");
  if (user != null) return redirect("/app");

  return (
    <div className="container flex flex-col items-center justify-center h-screen gap-4">
      <h1 className="text-4xl">Creating your account...</h1>
      <OnboardingClient userId={userId} />
    </div>
  );
}
/*
 * Onboarding页面通常是用户首次注册或登录后的引导页面
 * 在这个项目中，它有一个非常特殊的作用: 它是用户数据同步的等待页面：
 *    用户在Clerk完成登录/注册 → Clerk返回userId
 *    Clerk触发webhook → 调用/api/webhooks/clerk/route.ts
 *    Webhook处理用户数据 → 将Clerk用户信息同步到本地数据库
 *    Onboarding页面轮询检查 → 每250ms检查用户数据是否已同步完成
 */
