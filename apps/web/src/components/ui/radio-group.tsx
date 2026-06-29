import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "@phosphor-icons/react";
import { forwardRef, type ReactNode } from "react";

import { cn } from "../../lib/utils/cn.js";

export const RadioGroup = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => <RadioGroupPrimitive.Root className={cn("grid gap-2", className)} ref={ref} {...props} />);

RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

export const RadioGroupItem = forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
  <RadioGroupPrimitive.Item
    className={cn(
      "aspect-square size-4 rounded-full border border-input bg-card text-primary shadow-sm",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    ref={ref}
    {...props}
  >
    <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
      <Circle className="size-2 fill-current text-current" aria-hidden="true" />
    </RadioGroupPrimitive.Indicator>
  </RadioGroupPrimitive.Item>
));

RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export function RadioOption({
  children,
  className,
  value,
  ...props
}: React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item> & { children: ReactNode }) {
  return (
    <label className={cn("flex min-h-10 items-center gap-3 rounded-lg border border-border bg-card px-3 text-sm", className)}>
      <RadioGroupItem value={value} {...props} />
      <span>{children}</span>
    </label>
  );
}
