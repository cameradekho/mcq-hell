"use client";

import { useState } from "react";

import { marked } from "marked";

export type UseCopyToClipboardProps = {
  timeout?: number;
};

export type CopyOptions = {
  richText?: boolean;
};

export function useCopyToClipboard({
  timeout = 2000,
}: UseCopyToClipboardProps) {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (
    value: string,
    { richText = true }: CopyOptions = {}
  ) => {
    if (typeof window === "undefined") {
      return;
    }

    if (!value) {
      return;
    }

    const setCopiedWithTimeout = () => {
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, timeout);
    };

    if (richText) {
      try {
        const htmlContent = marked.parse(value, {
          async: false,
        }) as string;

        const tempElement = document.createElement("div");
        tempElement.innerHTML = htmlContent;

        if (navigator.clipboard && typeof ClipboardItem !== "undefined") {
          navigator.clipboard
            .write([
              new ClipboardItem({
                "text/html": new Blob([htmlContent], { type: "text/html" }),
                "text/plain": new Blob([tempElement.innerText], {
                  type: "text/plain",
                }),
              }),
            ])
            .then(() => {
              setCopiedWithTimeout();
            })
            .catch((err) => {
              console.error("Failed to copy with HTML: ", err);

              fallbackCopy(tempElement.innerText, setCopiedWithTimeout);
            });
          return;
        } else {
          fallbackCopy(tempElement.innerText, setCopiedWithTimeout);
          return;
        }
      } catch (error) {
        console.error("Error during rich text copy: ", error);
      }
    }

    fallbackCopy(value, setCopiedWithTimeout);
  };

  const fallbackCopy = (text: string, onSuccess: () => void) => {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(onSuccess)
        .catch((err) => {
          console.error("Clipboard API failed:", err);
        });
    } else {
      console.warn("Clipboard API not available in this browser/environment");
    }
  };

  return { isCopied, copyToClipboard };
}
