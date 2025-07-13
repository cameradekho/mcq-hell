"use client";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";

import { CodeBlock } from "@/components/markdown/code-block";

import { MemoizedReactMarkdown } from "./memoized-react-markdown";

type MarkdownProps = {
  text: string;
  className?: string;
};

export const Markdown = ({ text, className = "" }: MarkdownProps) => {
  return (
    <MemoizedReactMarkdown
      className={cn(
        "prose w-full dark:prose-invert prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-h4:text-base prose-h5:text-sm prose-h6:text-xs prose-p:leading-relaxed prose-code:whitespace-pre-wrap prose-pre:bg-transparent prose-pre:p-0 prose-pre:text-foreground",
        className
      )}
      components={{
        ul({ children }) {
          return (
            <ul className={cn("marker:text-accent", className)}>{children}</ul>
          );
        },
        code({ children, className, ...rest }) {
          const match = /language-(\w+)/.exec(className || "");
          return match ? (
            <CodeBlock
              {...rest}
              key={crypto.randomUUID()}
              language={(match && match[1]) || ""}
              value={String(children).replace(/\n$/, "")}
            />
          ) : (
            <code className={className} {...rest}>
              {children}
            </code>
          );
        },
      }}
      rehypePlugins={[rehypeRaw]}
      remarkPlugins={[remarkGfm]}
    >
      {text}
    </MemoizedReactMarkdown>
  );
};
