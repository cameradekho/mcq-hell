//this is  student dashboard
"use client";
import { addUser } from "@/action/add-user";
import { add } from "date-fns";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import { useEffect } from "react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { data: session, status } = useSession();

  useEffect(() => {
    async function addStudentToDb() {
      try {
        // Wait for session to be loaded
        if (status === "loading") return;

        if (session?.user) {
          const res = await addUser({
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.avatar,
            role: "student",
          });

          if (res.success) {
            console.log("student added successfully");
            toast.success("Student added successfully");
          } else {
            console.log("error: ", res.message);
            toast.error(res.message);
            return;
          }
        } else {
          console.log("No session found");
          toast.error("No session found");
          return;
        }
      } catch (error) {
        console.error("Error adding student to DB", error);
      }
    }

    addStudentToDb();
  }, [status]); // Add status to dependencies

  // Show loading while session is being fetched
  if (status === "loading") {
    return <div>Loading...</div>;
  }

  // Show error if no session
  if (!session) {
    return <div>Please log in</div>;
  }

  return (
    <div className=" text-white text-2xl font-extrabold italic h-screen flex flex-col items-center justify-center gap-6 bg-black">
      <Image
        src={session?.user?.avatar || ""}
        alt="Student"
        width={200}
        height={200}
        className="rounded-full p-1 h-16 w-16 bg-white border-2 border-gray-300"
      />
      <span>Hello, Student {session?.user?.name}</span>
      <span>Email is {session?.user.email}</span>
      <span>you are logged in as a {session?.user.role} </span>
      <button
        className=" bg-red-400 p-3 text-lg rounded-2xl cursor-pointer"
        onClick={() => signOut({ callbackUrl: "/form" })}
      >
        Log out
      </button>
    </div>
  );
}
