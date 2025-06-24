"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Home() {
  const params = useParams();
  const teacherId = params.teacherId; // assuming your route is /teacher/[id]

  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;
    setMessages([...messages, input]);
    setInput("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === "application/pdf") {
      console.log("Uploaded PDF:", file.name);
    } else {
      console.warn("Please upload a valid PDF file.");
    }
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="text-center">
        You must be logged in to access this page.
      </div>
    );
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100">
      <div className="w-full max-w-md space-y-4">
        <h1 className="text-2xl font-bold text-center">Create Exam By AI</h1>
        <span>Hello, {session?.user?.name}</span>
        <span>Teacher Id: {teacherId}</span>

        <Card className="h-96 overflow-y-auto space-y-2 p-4 bg-white">
          <CardContent className="flex flex-col gap-2 p-0">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className="self-end bg-blue-500 text-white px-4 py-2 rounded-lg max-w-xs"
              >
                {msg}
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="flex items-center gap-2">
          <Input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1"
          />
          <Button onClick={handleSend}>Send</Button>
        </div>

        <div className="flex items-center gap-2">
          <Input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </main>
  );
}
