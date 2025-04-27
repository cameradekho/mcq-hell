"use client";

import React, { useEffect, useRef } from "react";
import { useSession, signOut, signIn } from "next-auth/react";
import { addUser } from "../../action/add-user";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import "@fontsource/poppins";
import "@fontsource/rubik";
import Image from "next/image";
import { ITeacher } from "@/models/teacher";
import { AllExams } from "@/components/all-exams";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100 },
  },
};

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
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center min-h-screen bg-background text-foreground p-6 font-[Poppins]"
    >
      <div className="w-full max-w-7xl">
        <motion.div variants={itemVariants} className="mb-10 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold font-[Rubik] mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Welcome to Hell
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive exam preparation platform. Create, manage, and
            distribute your exams with ease.
          </p>
        </motion.div>

        {session ? (
          <motion.div variants={itemVariants} className="w-full">
            <Card className="bg-card border-border shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-8 px-4">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-4xl mx-auto">
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-primary to-secondary opacity-75 blur"></div>
                      <Image
                        src={session?.user?.avatar || "/images/cat-guest.png"}
                        alt="avatar"
                        width={80}
                        height={80}
                        className="relative rounded-full border-2 border-card bg-card"
                      />
                    </div>
                    <div className="text-left">
                      <h2 className="text-2xl font-semibold text-card-foreground">
                        {session?.user?.name || "Guest User"}
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {session?.user?.email}
                      </p>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleAllSignOut(session?.user?.email || "")}
                    variant="outline"
                    className="border-border bg-background/80 hover:bg-destructive hover:text-destructive-foreground transition-all"
                  >
                    Log Out
                  </Button>
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between px-6 mb-2">
                  <h3 className="text-2xl font-semibold text-card-foreground">
                    My Exams
                  </h3>
                </div>
                <Separator className="mb-4" />
                <AllExams teacherEmail={session?.user.email || ""} />
              </div>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            variants={itemVariants}
            className="w-full max-w-md mx-auto"
          >
            <Card className="bg-card border-border shadow-lg">
              <CardHeader className="text-center pb-2">
                <h2 className="text-2xl font-bold text-card-foreground">
                  Get Started
                </h2>
                <p className="text-muted-foreground text-sm">
                  Sign in to create and manage your exams
                </p>
              </CardHeader>
              <CardContent className="flex items-center justify-center py-8">
                <Image
                  src="/images/cat-guest.png"
                  alt="Login illustration"
                  width={120}
                  height={120}
                  className="rounded-full border-4 border-muted bg-secondary/20 p-1"
                />
              </CardContent>
              <CardFooter className="flex justify-center pb-6">
                <Button
                  onClick={() => signIn()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2 text-lg font-medium rounded-full"
                >
                  Log In
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
