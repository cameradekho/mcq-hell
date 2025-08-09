"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/auth-provider";
import { useFirebase } from "@/hooks/custom/use-firebase";
import AuthButtons from "./auth/auth-buttons";

export function TopNavigationBar() {
  const { session } = useAuth();
  const { logout } = useFirebase();

  return (
    <nav className="w-full bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary">ExamHell</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            {session.user ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/chat"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Chat
                </Link>
                <Link
                  href="/support"
                  className="text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Support
                </Link>
                <div className="flex items-center space-x-2">
                  <Image
                    src={session.user.avatar || "/images/cat-guest.png"}
                    alt="avatar"
                    width={32}
                    height={32}
                    className="rounded-full border border-border"
                  />
                  <span className="text-sm font-medium text-foreground">
                    {session.user.name}
                  </span>
                </div>
                <Button variant="outline" onClick={logout} className="text-sm">
                  Sign Out
                </Button>
              </div>
            ) : (
              <AuthButtons />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
