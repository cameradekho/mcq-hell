"use client";

import { useState } from "react";
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./admin-sidebar";
import { TicketsClient } from "./tickets-client";
import { ITicket } from "@/models/ticket";

type AdminLayoutClientProps = {
  initialTickets: ITicket[];
  initialTotalPages: number;
  currentPage: number;
};

export function AdminLayoutClient({
  initialTickets,
  initialTotalPages,
  currentPage,
}: AdminLayoutClientProps) {
  const [activeTab, setActiveTab] = useState("tickets");

  return (
    <>
      <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-4 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-lg font-semibold">
              {activeTab === "tickets" ? "Tickets" : "Admin"}
            </h1>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          {activeTab === "tickets" && (
            <TicketsClient
              initialTickets={initialTickets}
              initialTotalPages={initialTotalPages}
              currentPage={currentPage}
            />
          )}
        </div>
      </SidebarInset>
    </>
  );
}
