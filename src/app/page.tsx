"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { addUser } from "../../action/add-user";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import "@fontsource/poppins";
import "@fontsource/rubik";
import Image from "next/image";
import { ITeacher } from "@/models/teacher";
import { AllExams } from "@/components/all-exams";

export default function Home() {
  const { data: session } = useSession();
  const hasRun = useRef(false);

  useEffect(() => {
    const addUserToDB = async () => {
      if (hasRun.current) return;
      hasRun.current = true;
      try {
        if (session) {
          const result = await addUser({
            name: session.user.name,
            email: session.user.email,
            avatar: session.user.avatar,
          });

          if (result.success) {
            toast.success("User added successfully!");
          } else {
            toast.error(result.message);
          }
        }
      } catch (error) {
        toast.error("Error adding user: " + error);
      }
    };

    if (session) {
      addUserToDB();
    }
  }, [session]);

  const handleAllSignOut = async (email: ITeacher["email"]) => {
    signOut();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fdfbfb] via-[#ebedee] to-[#dfe9f3] text-gray-900 p-6 font-[Poppins]"
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="text-4xl md:text-6xl font-extrabold text-center mb-8 drop-shadow-lg font-[Rubik] text-gray-800"
      >
        Welcome to Hell
      </motion.h1>

      {session ? (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className=" w-full flex flex-col items-center justify-center"
        >
          <Card className="bg-gray-50 w-9/12 p-8 rounded-2xl shadow-xl border border-gray-200 text-center">
            <CardHeader>
              <Image
                src={session?.user?.avatar || "/images/cat-guest.png"}
                alt="avatar"
                width={1200}
                height={1200}
                className="mx-auto w-20 h-20 border border-gray-300 shadow-md rounded-full"
              />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold text-gray-800">
                {session?.user?.name || "Guest User"}
              </p>
              <p className="text-sm text-gray-500">{session?.user?.email}</p>
              <Separator className="my-4" />
              <Button
                onClick={() => handleAllSignOut(session?.user?.email || "")}
                variant="destructive"
                className=" border-gray-300 text-gray-200 hover:border-gray-900 hover:text-gray-900 transition-all text-lg font-semibold p-2 w-72"
              >
                Log Out
              </Button>
              <br />

              <AllExams teacherEmail={session?.user.email || ""} />
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col items-center justify-center"
        >
          <Button
            onClick={() => signIn()}
            className="mt-6 bg-gradient-to-r from-[#7F00FF] to-[#E100FF] text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:from-[#6a00cc] hover:to-[#c300cc] transition-all"
          >
            Log In
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
