import { memo, type FC } from "react";

import ReactMarkdown, { type Options } from "react-markdown";

interface MarkdownOptions extends Options {
  className?: string;
}

export const MemoizedReactMarkdown: FC<MarkdownOptions> = memo(
  ReactMarkdown as FC<MarkdownOptions>,
  (prevProps, nextProps) => prevProps.children === nextProps.children
);
