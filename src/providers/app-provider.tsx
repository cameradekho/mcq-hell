"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./auth-provider";
import { ChatProvider } from "./chat-provider";
import { queryClient } from "@/lib/query-client";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <ChatProvider>
          <TooltipProvider delayDuration={100}>{children}</TooltipProvider>
          <Toaster />
        </ChatProvider>
      </QueryClientProvider>
    </AuthProvider>
  );
};
