import { Badge } from "../ui/badge.js";

export function StatusBadge({ status }: { status?: string | null }) {
  if (status === "published" || status === "ready" || status === "passed" || status === "open") {
    return <Badge tone="success">{statusLabel(status)}</Badge>;
  }

  if (status === "closed" || status === "failed" || status === "needs_review") {
    return <Badge tone={status === "needs_review" ? "warning" : "destructive"}>{statusLabel(status)}</Badge>;
  }

  if (status === "processing" || status === "generating" || status === "queued") {
    return <Badge tone="accent">{statusLabel(status)}</Badge>;
  }

  return <Badge>{statusLabel(status)}</Badge>;
}

function statusLabel(status?: string | null) {
  if (!status) {
    return "Unknown";
  }

  const labels: Record<string, string> = {
    not_checked: "Not reviewed",
    needs_review: "Review needed",
    not_ready: "Not ready",
    processing: "Preparing",
    generating: "Preparing",
    queued: "Waiting",
    published: "Published",
    draft: "Draft",
    closed: "Closed",
    ready: "Ready",
    passed: "Looks good",
    failed: "Needs retry",
    high: "High priority",
    medium: "Medium priority",
    low: "Low priority",
    positive: "Positive",
    neutral: "Neutral",
    negative: "Negative",
    mixed: "Mixed",
    open: "Open",
  };

  if (labels[status]) {
    return labels[status];
  }

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
