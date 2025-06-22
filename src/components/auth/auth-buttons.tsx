"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "../ui/button";
import Link from "next/link";

type Props = {
  signInbtnText?: string;
  signOutbtnText?: string;
};

export default function AuthButtons({ props }: { props?: Props }) {
  const { data: session, status } = useSession();
  const signInText = props?.signInbtnText || "Sign In";
  const signOutText = props?.signOutbtnText || "Sign Out";

  if (status === "loading") {
    return <div className="text-white">Loading...</div>;
  }

  if (session) {
    return (
      <Button
        onClick={() => signOut({ callbackUrl: "/form" })}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-150 hover:scale-110 ease-in-out"
      >
        {signOutText}
      </Button>
    );
  }

  return (
    <Link href="/form">
      <Button
        //onClick={() => signIn("google", { callbackUrl: "/" })}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-150 hover:scale-110 ease-in-out"
      >
        {signInText}
      </Button>
    </Link>
  );
}
