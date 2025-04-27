import { redirect } from "next/navigation";
import { auth } from "../../../auth";
import { QuestionMaker } from "@/components/question-maker";

export default async function AddExamPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

  // If needed, set the allowed email/userEmail manually or fetch from DB
  const allowedEmail = session.user.email; // or "someone@example.com"

  const isOwner = session.user.email === allowedEmail;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">
        Add Exam for{" "}
        {isOwner ? (
          <span className="text-green-600">{session.user.name}</span>
        ) : (
          <span className="text-red-600">Unauthorized User</span>
        )}
      </h1>

      {isOwner ? (
        <QuestionMaker userEmail={session.user.email} />
      ) : (
        <p className="mt-4 text-muted-foreground">
          You don’t have permission to add exams.
        </p>
      )}
    </div>
  );
}
