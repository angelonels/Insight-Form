import { cn } from "../../lib/utils/cn.js";

export function BrandLogo({
  className,
  variant = "lockup",
}: {
  className?: string;
  variant?: "lockup" | "mark";
}) {
  const isMark = variant === "mark";

  return (
    <img
      alt="InsightForm"
      className={cn(isMark ? "h-9 w-auto" : "h-8 w-auto", className)}
      height={isMark ? 1351 : 482}
      src={isMark ? "/brand/insightform-mark-dark.png" : "/brand/insightform-lockup-dark.png"}
      width={isMark ? 1128 : 2076}
    />
  );
}
