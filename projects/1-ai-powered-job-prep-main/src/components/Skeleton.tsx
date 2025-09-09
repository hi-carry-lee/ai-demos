import { cn } from "@/lib/utils";

// 实际Skeleton的尺寸，可以由 className 来控制
export function Skeleton({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // w-full max-w-full看起来重复了，max-w-full只有当你希望防止调用方通过 className 传入更大的宽度（如 w-[120%]、min-w-*）导致溢出时，保留它才有意义
        "animate-pulse bg-muted rounded h-[1.25em] w-full max-w-full inline-block align-bottom",
        className
      )}
    />
  );
}

export function SkeletonButton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-9", className)} />;
}
