export const StreamingMessage = ({ message }: { message: string[] }) => {
  return (
    <div className="flex justify-start px-4 md:px-8 py-3">
      <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg max-w-[80%] break-words">
        {message.map((m) => m).join("")}
      </div>
    </div>
  );
};
