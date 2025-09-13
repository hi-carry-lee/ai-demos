import { ConnectionMessage } from "@humeai/voice-react";
import { JsonMessage, ReturnChatEvent } from "hume/api/resources/empathicVoice";

/*
  ReturnChatEvent: 通话结束后一次性获取全部聊天记录
  JsonMessage: 备用/标准化格式，这是Hume的标准REST API调用
  ConnectionMessage: 语音通话进行时，毫秒级实时更新，用户说话立即显示
*/
type Message = JsonMessage | ConnectionMessage | ReturnChatEvent;

export function condenseChatHistory(messages: Message[]) {
  return messages.reduce((acc, message) => {
    const data = getChatEventData(message) ?? getJsonMessageData(message);
    if (data == null || data.content == null) {
      return acc;
    }

    const lastMessage = acc.at(-1);
    if (lastMessage == null) {
      acc.push({ isUser: data.isUser, content: [data.content] });
      return acc;
    }

    if (lastMessage.isUser === data.isUser) {
      lastMessage.content.push(data.content);
    } else {
      acc.push({ isUser: data.isUser, content: [data.content] });
    }

    return acc;
  }, [] as { isUser: boolean; content: string[] }[]);
}

function getJsonMessageData(message: Message) {
  if (message.type !== "user_message" && message.type !== "assistant_message") {
    return null;
  }

  return {
    isUser: message.type === "user_message",
    content: message.message.content,
  };
}

function getChatEventData(message: Message) {
  if (message.type !== "USER_MESSAGE" && message.type !== "AGENT_MESSAGE") {
    return null;
  }

  return {
    isUser: message.type === "USER_MESSAGE",
    content: message.messageText,
  };
}
