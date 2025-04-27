import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { QuestionMaker } from "@/components/question-maker";
import { Card, CardHeader, CardContent } from "@/components/ui/card";

export default async function AddExamPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  const allowedEmail = session.user.email;
  const isOwner = session.user.email === allowedEmail;

  return (
    <div className="container max-w-5xl mx-auto py-8 px-4">
      <Card className="border shadow-md bg-card">
        <CardHeader className="pb-0">
          <div className="flex flex-col space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight">
              {isOwner ? (
                <>
                  Create Exam for{" "}
                  <span className="text-primary">{session.user.name}</span>
                </>
              ) : (
                <span className="text-destructive">Unauthorized Access</span>
              )}
            </h1>
            <p className="text-muted-foreground text-sm">
              {isOwner
                ? "Fill out the form below to create a new exam with multiple choice questions."
                : "You don't have permission to add exams."}
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {isOwner ? (
            <QuestionMaker userEmail={session.user.email} />
          ) : (
            <p className="text-destructive">
              You don&apos;t have permission to add exams.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
