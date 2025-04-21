// app/login/page.tsx
"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import AuthButtons from "@/components/AuthButtons";

export default function LoginPage() {
  const { data: session, status } = useSession();

  // If authenticated, redirect to home page
  if (status === "authenticated") {
    redirect("/");
  }

  return (
    <div className="grid place-items-center min-h-screen bg-black">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-bold text-white">QR Code Generator</h1>
        <p className="text-neutral-400 max-w-md text-center mb-4">
          Please sign in with your Google account to access the QR code generator app.
        </p>
        <AuthButtons />
      </div>
    </div>
  );
}