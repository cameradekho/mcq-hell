"use client";

import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from "react";

type TChatContextType = {
  pendingMessage: string | null;
  setPendingMessage: Dispatch<SetStateAction<string | null>>;
};

const ChatContext = createContext<TChatContextType | undefined>(undefined);

export const ChatProvider = ({ children }: { children: ReactNode }) => {
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  return (
    <ChatContext.Provider
      value={{
        pendingMessage,
        setPendingMessage,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChatContext must be used within a ChatProvider");
  }
  return context;
};
