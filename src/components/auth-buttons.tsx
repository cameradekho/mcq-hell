// components/AuthButtons.tsx
"use client";
import { useSession, signIn, signOut } from "next-auth/react";

export const AuthButtons = () => {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="text-white">Loading...</div>;
  }

  if (session) {
    return (
      <button
        onClick={() => signOut({ callbackUrl: "/form" })}
        className="bg-red-600 hover:bg-red-700 text-white rounded-full px-4 py-2 font-medium"
      >
        Sign Out
      </button>
    );
  }

  return (
    <button
      onClick={() => signIn("google", { callbackUrl: "/" })}
      className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-4 py-2 font-medium"
    >
      Sign In
    </button>
  );
};
