"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Ticket } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("tickets");

  const { data: session } = useSession();

  if (!session?.user?.email) {
    return <div>You are not authorized to access this page</div>;
  }

  return (
    <>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-2">
            <h2 className="text-lg font-semibold">Admin Panel</h2>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                isActive={activeTab === "tickets"}
                onClick={() => setActiveTab("tickets")}
              >
                <Ticket className="h-4 w-4" />
                <span>Tickets</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-semibold">
              {activeTab === "tickets" ? "Tickets" : "Admin"}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {activeTab === "tickets" && (
            <div className="flex flex-1 items-center justify-center">
              <div className="text-center">
                <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No tickets yet</h3>
                <p className="text-muted-foreground">
                  Tickets will appear here when they are created.
                </p>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </>
  );
}
