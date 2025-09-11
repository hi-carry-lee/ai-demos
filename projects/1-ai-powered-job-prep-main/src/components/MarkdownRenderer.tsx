import { cn } from "@/lib/utils";
import { ComponentProps } from "react";
import Markdown from "react-markdown";

export function MarkdownRenderer({
  className,
  ...props
}: // 使用TS的类型组合语法：&
{ className?: string } & ComponentProps<typeof Markdown>) {
  return (
    <div
      className={cn(
        // max-w-none：移除默认的最大宽度限制
        "max-w-none prose prose-neutral dark:prose-invert font-sans",
        className
      )}
    >
      <Markdown {...props} />
    </div>
  );
}
