import { cn } from "@/lib/utils";
import { Loader2Icon } from "lucide-react";
import type { ReactNode } from "react";

/*
不是 Shadcn 的标准组件，而是一个基于 Shadcn 设计理念定制的组件，这个组件的特点：
  使用了 Shadcn 的设计模式：
  导入了 cn 工具函数（来自 @/lib/utils）
  使用了 lucide-react 图标库（Shadcn 常用的图标库）
  遵循了 Shadcn 组件的 TypeScript 类型定义风格
自定义功能：
  实现了一个"加载状态切换"的效果
  使用 CSS Grid 布局来重叠显示内容和加载图标
  通过 invisible/visible 类来控制显示状态，而不是完全移除 DOM 元素
设计思路：
  当 isLoading 为 true 时，显示旋转的加载图标
  当 isLoading 为 false 时，显示实际内容
  使用 Grid 布局确保切换时不会发生布局偏移
*/
export function LoadingSwap({
  isLoading,
  children,
  className,
  loadingIconClassName,
}: {
  isLoading: boolean;
  children: ReactNode;
  className?: string;
  loadingIconClassName?: string;
}) {
  // 使用了 CSS Grid 的重叠定位技术：即两个 div 都使用了相同的网格位置
  // col-start-1 col-end-2 row-start-1 row-end-2，用来避免布局偏移
  return (
    <div className="grid grid-cols-1 items-center justify-items-center">
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2 w-full",
          isLoading ? "invisible" : "visible",
          className
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          "col-start-1 col-end-2 row-start-1 row-end-2",
          isLoading ? "visible" : "invisible",
          className
        )}
      >
        <Loader2Icon className={cn("animate-spin", loadingIconClassName)} />
      </div>
    </div>
  );
}
