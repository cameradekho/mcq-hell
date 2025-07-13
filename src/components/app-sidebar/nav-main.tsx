"use client";

import Link from "next/link";

import { History, MessageSquare } from "lucide-react";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const MAIN_NAVIGATION_ITEMS = [
  {
    title: "Chat",
    url: "/chat/new",
    icon: MessageSquare,
  },
  {
    title: "History",
    url: "/chat/history",
    icon: History,
  },
];

export function NavMain() {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>AI Assistant</SidebarGroupLabel>
      <SidebarMenu>
        {MAIN_NAVIGATION_ITEMS.map((item) => (
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={item.title} asChild>
              <Link href={item.url}>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
