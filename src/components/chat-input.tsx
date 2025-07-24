import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, Loader2, Paperclip } from "lucide-react";
import { useEffect } from "react";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type ChatInputProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
  isStreaming: boolean;
  onPaperclipClick?: () => void;
};

export const ChatInput = ({
  onSubmit,
  isStreaming,
  onPaperclipClick,
}: ChatInputProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (isStreaming) {
      form.reset({
        message: "",
      });
    }
  }, [isStreaming]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center justify-between gap-1 w-full relative bg-background min-h-32 border rounded-2xl"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea
                  placeholder="Ask a question..."
                  className="resize-none border-none outline-none shadow-none"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-between w-full p-2">
          <Button variant="ghost" size="icon" onClick={onPaperclipClick}>
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            className="rounded-full size-10 flex items-center justify-center"
            disabled={isStreaming}
          >
            {isStreaming ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};
