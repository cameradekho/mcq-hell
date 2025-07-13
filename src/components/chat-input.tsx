import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp } from "lucide-react";

const formSchema = z.object({
  message: z.string().min(1, "Message is required"),
});

type ChatInputProps = {
  onSubmit: (data: z.infer<typeof formSchema>) => void;
};

export const ChatInput = ({ onSubmit }: ChatInputProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col items-center gap-3 w-full relative"
      >
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl>
                <Textarea
                  placeholder="Ask a question..."
                  className="min-h-[120px] resize-none"
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      form.handleSubmit(onSubmit)();
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button className="rounded-full absolute right-4 bottom-4 size-10 flex items-center justify-center">
          <ArrowUp className="w-4 h-4" />
        </Button>
      </form>
    </Form>
  );
};
