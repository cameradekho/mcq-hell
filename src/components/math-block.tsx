import katex from "katex";
import "katex/dist/katex.min.css";

export default function MathBlock({ item }: { item: string | undefined }) {
  if (!item) return item;
  const html = katex.renderToString(item, {
    throwOnError: false,
  });

  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
