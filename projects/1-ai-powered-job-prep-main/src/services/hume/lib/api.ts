import { env } from "@/data/env/server";
import { HumeClient } from "hume";
import { ReturnChatEvent } from "hume/api/resources/empathicVoice";

// ! 从Hume获取面试对话数据
/*
 * 面试数据的处理：
 *1. 连接 Hume，实时获取会话数据
 *2. 将数据缓存在Nextjs中，并不设置缓存Tag，因为面试会话已结束，数据不会再变化
 */
export async function fetchChatMessages(humeChatId: string) {
  "use cache";

  const client = new HumeClient({ apiKey: env.HUME_API_KEY });
  const allChatEvents: ReturnChatEvent[] = [];
  const chatEventsIterator = await client.empathicVoice.chats.listChatEvents(
    humeChatId,
    { pageNumber: 0, pageSize: 100 }
  );

  for await (const chatEvent of chatEventsIterator) {
    allChatEvents.push(chatEvent);
  }

  return allChatEvents;
}
