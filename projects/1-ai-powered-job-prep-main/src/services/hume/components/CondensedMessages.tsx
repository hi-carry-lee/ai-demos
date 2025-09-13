import { UserAvatar } from "@/features/users/components/UserAvatar";
import { cn } from "@/lib/utils";
import { BrainCircuitIcon } from "lucide-react";

export function CondensedConversation({
  messages,
  user,
  className,
  maxFft = 0,
}: {
  messages: { isUser: boolean; content: string[] }[];
  user: { name: string; imageUrl: string };
  className?: string;
  maxFft?: number;
}) {
  return (
    <div className={cn("flex flex-col gap-4 w-full", className)}>
      {messages.map((message, index) => {
        // 有音频活动：maxFft > 0 表示AI正在说话
        const shouldAnimate = index === messages.length - 1 && maxFft > 0;

        return (
          <div
            key={index}
            className={cn(
              "flex items-center gap-5 border pl-4 pr-6 py-4 rounded max-w-3/4",
              message.isUser ? "self-end" : "self-start"
            )}
          >
            {/* 用户头像 */}
            {message.isUser ? (
              <div className="flex items-start gap-5">
                {/* 消息内容 */}
                <div className="flex flex-col gap-1">
                  {message.content.map((text, i) => (
                    <span key={i}>{text}</span>
                  ))}
                </div>
                <UserAvatar
                  user={user}
                  className="size-8 flex-shrink-0 border-1 border-purple-600"
                />
              </div>
            ) : (
              <div className="flex items-start gap-5">
                <div className="relative">
                  <div
                    className={cn(
                      // !inset-0 等价于 top:0; right:0; bottom:0; left:0;
                      // !用来让这个div和下面图标重叠，并且作为icon的背景
                      "absolute inset-0 border-muted border-4 rounded-full",
                      // !animate-ping：外层的有脉冲波纹效果，用来表示AI正在说话
                      shouldAnimate ? "animate-ping" : "hidden"
                    )}
                  />
                  <BrainCircuitIcon
                    className="size-6 flex-shrink-0 relative"
                    // 如果AI正在说话，则放大图标
                    style={
                      shouldAnimate ? { scale: maxFft / 8 + 1 } : undefined
                    }
                    // !为什么是除以8？这是一个经验值，用来控制图标的大小
                  />
                </div>
                {/* 消息内容 */}
                <div className="flex flex-col gap-1">
                  {message.content.map((text, i) => (
                    <span key={i}>{text}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
