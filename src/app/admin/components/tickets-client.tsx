"use client";

import { useState, useEffect } from "react";
import { produce } from "immer";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Ticket, Search, Copy, Check } from "lucide-react";
import { ITicket } from "@/models/ticket";
import { toast } from "sonner";
import { useQueryParams } from "@/hooks/custom/use-query-params";
import { format } from "date-fns";
import { updateTicket } from "@/action/update-ticket";

type TicketsClientProps = {
  initialTickets: ITicket[];
  initialTotalPages: number;
  currentPage: number;
};

export function TicketsClient({
  initialTickets,
  initialTotalPages,
  currentPage,
}: TicketsClientProps) {
  const { params, updateParams, updateParam } = useQueryParams();
  const [copiedTicketId, setCopiedTicketId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(params.search || "");
  const [tickets, setTickets] = useState<ITicket[]>(initialTickets);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== (params.search || "")) {
        updateParams({ search: searchInput || undefined, page: undefined });
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput, params.search, updateParams]);

  useEffect(() => {
    setSearchInput(params.search || "");
  }, [params.search]);

  useEffect(() => {
    setTickets(initialTickets);
  }, [initialTickets]);

  const handleStatusFilter = (value: string) => {
    updateParams({
      status: value === "all" ? undefined : value,
      page: undefined,
    });
  };

  const handlePageChange = (newPage: number) => {
    updateParam("page", newPage === 1 ? undefined : newPage.toString());
  };

  const copyTicketId = async (ticketId: string) => {
    try {
      await navigator.clipboard.writeText(ticketId);
      setCopiedTicketId(ticketId);
      toast.success("Ticket ID copied to clipboard");
      setTimeout(() => setCopiedTicketId(null), 2000);
    } catch (error) {
      toast.error("Failed to copy ticket ID");
    }
  };

  const truncateTicketId = (ticketId: string) => {
    return ticketId.length > 6 ? `${ticketId.substring(0, 6)}...` : ticketId;
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    const result = await updateTicket({
      _id: ticketId,
      status: status as "open" | "closed",
    });

    if (result.success) {
      setTickets(
        produce((draft) => {
          const ticketIndex = draft.findIndex(
            (ticket) => ticket._id.toString() === ticketId
          );
          if (ticketIndex !== -1) {
            draft[ticketIndex].status =
              result.data?.status || (status as "open" | "closed");
            if (result.data?.updatedAt) {
              draft[ticketIndex].updatedAt = result.data.updatedAt;
            }
          }
        })
      );
    }

    toast[result.success ? "success" : "error"](result.message);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by ticket ID or email..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 w-64"
          />
        </div>
        <Select
          value={params.status || "all"}
          onValueChange={handleStatusFilter}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {tickets.length === 0 ? (
        <div className="flex flex-1 items-center justify-center py-8">
          <div className="text-center">
            <Ticket className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No tickets found</h3>
            <p className="text-muted-foreground">
              {params.search || (params.status && params.status !== "all")
                ? "Try adjusting your search or filter criteria."
                : "Tickets will appear here when they are created."}
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Ticket ID</TableHead>
                  <TableHead className="max-w-xs">Description</TableHead>
                  <TableHead className="w-24">Status</TableHead>
                  <TableHead className="w-48">Email</TableHead>
                  <TableHead className="w-32">Created At</TableHead>
                  <TableHead className="w-32">Updated At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket._id.toString()}>
                    <TableCell className="font-mono">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-1 font-mono text-xs hover:bg-muted"
                            onClick={() => copyTicketId(ticket.ticketId)}
                          >
                            <span className="mr-1">
                              {truncateTicketId(ticket.ticketId)}
                            </span>
                            {copiedTicketId === ticket.ticketId ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="font-mono">{ticket.ticketId}</p>
                          <p className="text-xs text-muted-foreground">
                            Click to copy
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate" title={ticket.message}>
                        {ticket.message}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={ticket.status}
                        onValueChange={(value) => {
                          handleStatusChange(ticket._id.toString(), value);
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-sm">{ticket.email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(ticket.createdAt, "MMM dd, yy : HH:mm")}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(ticket.updatedAt, "MMM dd, yy : HH:mm")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {initialTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {initialTotalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === initialTotalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
