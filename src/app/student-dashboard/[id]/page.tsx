"use client";
import { signOut } from "next-auth/react";
import { useParams } from "next/navigation";

export default function Home() {
  const params = useParams();

  const { id } = params;
  return (
    <div className=" text-white text-2xl font-extrabold italic h-screen flex flex-col items-center justify-center gap-6 bg-black">
      <span>Hello, Student</span>
      <span>
        you are logged in as a student, whose id is {id || "not yet set"}
      </span>
      <button
        className=" bg-red-400 p-3 text-lg rounded-2xl cursor-pointer"
        onClick={() => signOut({ callbackUrl: "/form" })}
      >
        Log out
      </button>
    </div>
  );
}
