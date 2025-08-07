"use client";

import Link from "next/link";
import { useState } from "react";
import { format } from "date-fns";

import {
  History,
  MessageSquare,
  ChevronDown,
  ChevronRight,
} from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";
import { useGetAllConversations } from "@/hooks/api/conversation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

export function NavMain() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(true);

  const { data: conversations } = useGetAllConversations({
    limit: 10,
  });

  return (
    <SidebarGroup>
      <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
      <SidebarMenu>
        {/* Chat Link */}
        <SidebarMenuItem>
          <SidebarMenuButton tooltip="Chat" asChild>
            <Link href="/chat/new">
              <MessageSquare />
              <span>Chat</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>

        {/* History with Collapsible Sub-items */}
        <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <SidebarMenuItem>
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="History">
                <History />
                <span>History</span>
                {isHistoryOpen ? (
                  <ChevronDown className="ml-auto" />
                ) : (
                  <ChevronRight className="ml-auto" />
                )}
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                {conversations?.data?.map((conversation) => (
                  <SidebarMenuSubItem key={conversation._id}>
                    <SidebarMenuSubButton asChild>
                      <Link href={`/chat/${conversation._id}`}>
                        <span className="truncate">
                          {conversation.name || "Untitled"}
                        </span>
                        <span className="ml-auto text-xs text-muted-foreground">
                          {format(conversation.createdAt, "MMM d")}
                        </span>
                      </Link>
                    </SidebarMenuSubButton>
                  </SidebarMenuSubItem>
                ))}
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton asChild>
                    <Link
                      href="/chat/history"
                      className="text-muted-foreground"
                    >
                      <span>View all →</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </SidebarMenuItem>
        </Collapsible>
      </SidebarMenu>
    </SidebarGroup>
  );
}
