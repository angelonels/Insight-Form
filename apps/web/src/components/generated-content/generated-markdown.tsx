import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { cn } from "../../lib/utils/cn.js";

type GeneratedMarkdownProps = {
  children: string;
  variant?: "answer" | "report";
  className?: string;
};

export function GeneratedMarkdown({
  children,
  className,
  variant = "answer",
}: GeneratedMarkdownProps) {
  const isReport = variant === "report";

  return (
    <div className={cn("min-w-0", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children: content }) =>
            isReport ? (
              <h1 className="mt-5 text-2xl font-semibold first:mt-0">{content}</h1>
            ) : (
              <h1 className="mt-4 text-xl font-semibold first:mt-0">{content}</h1>
            ),
          h2: ({ children: content }) =>
            isReport ? (
              <h2 className="mt-5 text-xl font-semibold first:mt-0">{content}</h2>
            ) : (
              <h2 className="mt-4 text-lg font-semibold first:mt-0">{content}</h2>
            ),
          h3: ({ children: content }) => (
            <h3 className="mt-4 text-lg font-semibold first:mt-0">{content}</h3>
          ),
          p: ({ children: content }) => (
            <p
              className={cn(
                "mt-3 text-sm leading-7 first:mt-0",
                isReport ? "text-foreground" : undefined,
              )}
            >
              {content}
            </p>
          ),
          table: ({ children: content }) => (
            <div className="mt-4 max-w-full overflow-x-auto rounded-lg border border-border-subtle">
              <table
                className={cn(
                  "w-full border-collapse text-left text-sm",
                  isReport ? "min-w-[32rem]" : "min-w-[28rem]",
                )}
              >
                {content}
              </table>
            </div>
          ),
          th: ({ children: content }) => (
            <th
              className={cn(
                "border-b border-border-subtle px-3 py-2 font-semibold",
                isReport ? "bg-muted" : "bg-muted/70",
              )}
            >
              {content}
            </th>
          ),
          td: ({ children: content }) => (
            <td className="border-b border-border-subtle px-3 py-2 align-top last:border-b-0">
              {content}
            </td>
          ),
          ul: ({ children: content }) => (
            <ul
              className={cn(
                "mt-3 list-disc space-y-2 pl-5 text-sm",
                isReport ? "text-muted-foreground" : undefined,
              )}
            >
              {content}
            </ul>
          ),
          ol: ({ children: content }) => (
            <ol
              className={cn(
                "mt-3 list-decimal space-y-2 pl-5 text-sm",
                isReport ? "text-muted-foreground" : undefined,
              )}
            >
              {content}
            </ol>
          ),
          li: ({ children: content }) => <li className="leading-7">{content}</li>,
          strong: ({ children: content }) => (
            <strong className={cn("font-semibold", isReport ? "text-foreground" : undefined)}>
              {content}
            </strong>
          ),
          blockquote: ({ children: content }) => (
            <blockquote className="mt-4 border-l-2 border-primary pl-4 text-sm italic text-muted-foreground">
              {content}
            </blockquote>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
