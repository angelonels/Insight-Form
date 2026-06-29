import { cn } from "../../lib/utils/cn.js";

export function Avatar({ imageUrl, name }: { imageUrl?: string | null; name?: string | null }) {
  const initial = (name?.trim().charAt(0) || "I").toUpperCase();

  if (imageUrl) {
    return <img alt={name ? `${name} avatar` : "User avatar"} className="size-9 rounded-full object-cover" src={imageUrl} />;
  }

  return (
    <span className={cn("grid size-9 place-items-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground")}>
      {initial}
    </span>
  );
}
