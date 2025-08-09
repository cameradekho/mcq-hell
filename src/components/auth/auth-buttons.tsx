"use client";
import { Button } from "../ui/button";
import Link from "next/link";
import { useAuth } from "@/context/auth-provider";
import { useFirebase } from "@/hooks/custom/use-firebase";

type Props = {
  signInbtnText?: string;
  signOutbtnText?: string;
};

export default function AuthButtons({ props }: { props?: Props }) {
  const { session } = useAuth();
  const { logout } = useFirebase();
  const signInText = props?.signInbtnText || "Sign In";
  const signOutText = props?.signOutbtnText || "Sign Out";

  if (session.loading) {
    return <div className="text-white">Loading...</div>;
  }

  if (session.user) {
    return (
      <Button
        onClick={logout}
        className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-150 hover:scale-110 ease-in-out"
      >
        {signOutText}
      </Button>
    );
  }

  return (
    <Link href="/sign-in">
      <Button className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl transition-all duration-150 hover:scale-110 ease-in-out">
        {signInText}
      </Button>
    </Link>
  );
}
