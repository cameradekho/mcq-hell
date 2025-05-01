import { redirect } from "next/navigation";
import { QuestionsWrapper } from "@/components/questions-wrapper";
import { auth } from "../../../auth";

export default async function Home() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/api/auth/signin");
  }

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
        <QuestionsWrapper userEmail={session.user.email} />
      ) : (
        <p className="mt-4 text-muted-foreground">
          You don’t have permission to add exams.
        </p>
      )}
    </div>
  );
}
