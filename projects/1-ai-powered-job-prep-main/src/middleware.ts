import arcjet, { detectBot, shield, slidingWindow } from "@arcjet/next";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { env } from "./data/env/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in(.*)",
  "/",
  "/api/webhooks(.*)",
]);

const aj = arcjet({
  key: env.ARCJET_KEY,
  rules: [
    shield({ mode: "LIVE" }), // LIVE表示生产环境模式，所有规则都会生效并执行
    detectBot({
      // 检测机器人请求
      mode: "LIVE",
      // 允许一些机器人请求通过
      allow: [
        "CATEGORY:SEARCH_ENGINE", // 用于搜索引擎的机器人，允许爬虫抓取内容
        "CATEGORY:MONITOR", // 用于监控系统是否正常的机器人，允许请求
        "CATEGORY:PREVIEW", // 用于分享应用到社交媒体时的预览，这样的请求允许通过
      ],
    }),
    slidingWindow({
      // 滑动窗口限流，1分钟内最多允许100个请求
      mode: "LIVE",
      interval: "1m",
      max: 100,
    }),
  ],
});

export default clerkMiddleware(async (auth, req) => {
  const decision = await aj.protect(req);

  if (decision.isDenied()) {
    // 第一个参数是响应的内容，这里简单处理直接返回null
    return new Response(null, { status: 403 });
  }

  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
