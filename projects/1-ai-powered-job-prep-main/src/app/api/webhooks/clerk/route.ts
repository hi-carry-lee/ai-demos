import { deleteUser, upsertUser } from "@/features/users/db";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  try {
    /*
    verifyWebhook的作用：一个重要的安全函数，它：
      ✅ 会校验 signing secret
      ✅ 验证请求的真实性
      ✅ 确保数据完整性
      ✅ 防止重放攻击
  */
    const event = await verifyWebhook(request);

    switch (event.type) {
      case "user.created":
      /*
        为什么不处理user.created事件？因为使用 upsertUser ，它可以同时处理两种情况：
          代码简化: 一个函数处理两种情况
          逻辑统一: 无论创建还是更新，都是"确保用户数据是最新的"
          错误处理: 避免了"用户已存在"或"用户不存在"的错误
          幂等性: 多次执行相同操作结果一致
        要注意Webhook 的不可靠性: Webhook 可能重复发送，可能乱序到达
        */
      case "user.updated":
        const clerkData = event.data;
        const email = clerkData.email_addresses.find(
          (e) => e.id === clerkData.primary_email_address_id
        )?.email_address;
        if (email == null) {
          return new Response("No primary email found", { status: 400 });
        }

        await upsertUser({
          id: clerkData.id,
          email,
          name: `${clerkData.first_name} ${clerkData.last_name}`,
          imageUrl: clerkData.image_url,
          createdAt: new Date(clerkData.created_at),
          updatedAt: new Date(clerkData.updated_at),
        });

        break;
      case "user.deleted":
        if (event.data.id == null) {
          return new Response("No user ID found", { status: 400 });
        }

        await deleteUser(event.data.id);
        break;
    }
  } catch {
    return new Response("Invalid webhook", { status: 400 });
  }

  return new Response("Webhook received", { status: 200 });
}
