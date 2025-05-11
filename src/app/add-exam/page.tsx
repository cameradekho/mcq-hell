"use client";

import { redirect } from "next/navigation";
import { QuestionsWrapper } from "@/components/questions-wrapper";
import { useSession } from "next-auth/react";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { Footer } from "@/components/ui/footer";

export default function Home() {
  return (
    <>
      <TopNavigationBar />
      <div className="p-4 min-h-[calc(100vh-8rem)]">
        <QuestionsWrapper />
      </div>
      <Footer />
    </>
  );
}
