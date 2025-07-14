import { parseMessage } from "@/lib/message-parser";

export const StreamingMessage = ({
  currentMessage,
}: {
  currentMessage: string[];
}) => {
  if (!currentMessage.length) return null;
  //const messageData = parseMessage(currentMessage.join(""));

  return (
    <div className="flex justify-start px-4 md:px-8 py-3">
      <div className=" dark:bg-gray-800 p-3 rounded-lg max-w-[80%] break-words">
        {currentMessage.map((m) => {
          const parts = parseMessage(m);
          console.log("parts", parts);
          return (
            <div
              key={m}
              className="flex flex-col gap-2 text-sm text-gray-800 dark:text-gray-200"
            >
              {parts.map((part, index) => {
                if (part.type === "text") {
                  return (
                    <span key={`${m}-${index}`} className="whitespace-pre-wrap">
                      {part.text}
                    </span>
                  );
                }

                if (part.type === "tag") {
                  console.log("%%%%%%%part.data", part.text);
                  return (
                    <span
                      key={`${m}-${index}`}
                      className="whitespace-pre-wrap bg-gray-100"
                    >
                      {JSON.stringify(part.text)}
                    </span>
                  );
                }
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};
