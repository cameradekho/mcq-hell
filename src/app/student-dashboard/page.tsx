//this is  student dashboard
"use client";
import { addUser } from "@/action/add-user";
import { add } from "date-fns";
import { signOut, useSession } from "next-auth/react";
import { useEffect } from "react";
import { toast } from "sonner";

export default function StudentDashboard() {
  const { data: session } = useSession();

  useEffect(() => {
    async function addStudentToDb() {
      try {
        if (session?.user) {
          const res = await addUser({
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.avatar,
            role: "student",
          });
        } else {
          console.log("session is not defined");
          toast.error("Session is not defined");
          return;
        }
      } catch (error) {
        console.error("Error adding student to DB", error);
      }
    }
    addStudentToDb();
  }, []);
  return (
    <div className=" text-white text-2xl font-extrabold italic h-screen flex flex-col items-center justify-center gap-6 bg-black">
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
