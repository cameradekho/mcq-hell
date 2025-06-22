"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, Loader2 } from "lucide-react";

type StudentExamAuthButtonProps = {
  teacherId: string;
  examId: string;
};

export default function StudentExamAuthButton({
  props,
}: {
  props: StudentExamAuthButtonProps;
}) {
  const { data: session, status } = useSession();

  const handleSignIn = () => {
    document.cookie = "authRole=student; path=/";
    signIn("google", {
      callbackUrl: `/exam/${props.teacherId}/${props.examId}`,
    });
  };

  if (status === "loading") {
    return (
      <Button
        disabled
        variant="outline"
        className="w-full group hover:bg-primary/5 hover:border-primary/50 transition-all duration-300"
      >
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <Button
        onClick={() => signOut({ callbackUrl: "/" })}
        variant="destructive"
        className="w-full group hover:bg-destructive/90 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md"
      >
        <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:scale-110" />
        Sign Out
      </Button>
    );
  }

  return (
    <Button
      onClick={handleSignIn}
      variant="outline"
      className="w-full group hover:bg-primary/5 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] shadow-sm hover:shadow-md"
    >
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
          <GraduationCap className="w-3 h-3 text-blue-600 transition-transform group-hover:scale-110" />
        </div>
        <span className="font-medium">Continue as Student</span>
      </div>
    </Button>
  );
}
