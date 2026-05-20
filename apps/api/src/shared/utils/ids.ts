import { randomBytes, randomUUID } from "node:crypto";

export function createId() {
  return randomUUID();
}

export function createPublicSlug(title: string) {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  const suffix = randomBytes(3).toString("hex");
  return `${base || "form"}-${suffix}`;
}
