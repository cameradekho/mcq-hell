"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { addTicket } from "@/action/add-ticket";
import { getTickets } from "@/action/get-tickets";
import { ITicket } from "@/models/ticket";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const ticketSchema = z.object({
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

type TicketFormData = z.infer<typeof ticketSchema>;

export default function SupportPage() {
  const [tickets, setTickets] = useState<ITicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<TicketFormData>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      message: "",
    },
  });

  const fetchTickets = async () => {
    try {
      const result = await getTickets({ status: "open" });
      if (result.success) {
        setTickets(result.data);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to fetch tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const onSubmit = async (data: TicketFormData) => {
    setSubmitting(true);
    try {
      const result = await addTicket(data);
      if (result.success) {
        toast.success("Ticket submitted successfully!");
        form.reset();
        fetchTickets(); // Refresh the tickets list
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="max-w-7xl w-full mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Support</h1>
        <p className="text-muted-foreground">
          Submit a support ticket or view your existing tickets
        </p>
      </div>

      {/* Add Ticket Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Submit a New Ticket</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Describe your issue</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Please describe your issue in detail..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Ticket"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Existing Tickets */}
      <Card>
        <CardHeader>
          <CardTitle>Your Open Tickets</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tickets.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No open tickets found
            </p>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <div
                  key={ticket.ticketId}
                  className="border rounded-lg p-4 space-y-3"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-foreground">
                        Ticket #{ticket.ticketId}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Created: {formatDate(ticket.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.status === "open" ? "default" : "secondary"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <p className="text-foreground">{ticket.message}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
