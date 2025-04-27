import { Suspense } from "react";
import Link from "next/link";
import { ArrowLeft, BookOpen } from "lucide-react";
import { motion } from "framer-motion";

export default function AddExamLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex items-center justify-between h-14 px-4 mx-auto">
          <div className="flex items-center gap-2">
            <Link href="/" className="flex items-center gap-2 md:gap-3">
              <BookOpen className="h-5 w-5 text-primary" />
              <span className="font-semibold">ExamHell</span>
            </Link>
          </div>
          <nav className="flex items-center gap-4">
            <Link
              href="/"
              className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dashboard</span>
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Suspense fallback={<div>Loading...</div>}>{children}</Suspense>
      </main>

      <footer className="border-t py-4 bg-muted/40">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} ExamHell. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
