import { useEffect, useState } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { Input } from "./ui/input";

interface MathInputProps {
  value: string;
  name: string;
  readOnly?: boolean;
  register: any;
}

export default function MathInput({
  value,
  name,
  readOnly,
  register,
}: MathInputProps) {
  const [renderedHTML, setRenderedHTML] = useState("");

  useEffect(() => {
    try {
      const html = katex.renderToString(value || "", { throwOnError: false });
      setRenderedHTML(html);
    } catch {
      setRenderedHTML("Invalid LaTeX");
    }
  }, [value]);

  return (
    <div className="relative w-full">
      {/* KaTeX-rendered overlay */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none text-gray-900 px-2 py-1"
        dangerouslySetInnerHTML={{ __html: renderedHTML }}
      />
      {/* Transparent input underneath */}
      <Input
        {...register(name)}
        value={value}
        readOnly={readOnly}
        className="w-full bg-transparent text-transparent caret-black px-2 py-1"
      />
    </div>
  );
}
