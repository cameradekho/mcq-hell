"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import { getUser } from "../../../action/get-user";

export const Navbar = () => {
  const [session, setSession] = useState<any>(null);

  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const user = await getUser({
  //         email: session?.user?.email,
  //         type: session?.user?.type,
  //       });
  //       setSession(user);
  //     } catch (error) {
  //       console.error("Error fetching user:", error);
  //     }
  //   };

  //   fetchUser();
  // }, []);

  return (
    <motion.nav
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg"
    >
      <Link href="/">
        <motion.h1
          whileHover={{ scale: 1.1 }}
          className="text-white text-2xl font-bold cursor-pointer"
        >
          MCQHell
        </motion.h1>
      </Link>
      <div className="hidden md:flex space-x-6">
        <Link href="/" className="text-white hover:text-gray-200 transition">
          Home
        </Link>
        <Link
          href="/lists"
          className="text-white hover:text-gray-200 transition"
        >
          Lists
        </Link>
        <Link
          href="/contact"
          className="text-white hover:text-gray-200 transition"
        >
          Contact
        </Link>
      </div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost">
            <Avatar>
              <AvatarImage
                src={session?.user?.avatar || "/default-avatar.png"}
                alt="Profile"
              />
            </Avatar>
          </Button>
        </DialogTrigger>
        <DialogContent>
          {session ? (
            <div className="text-center">
              <p className="text-lg font-bold">{session.user?.name}</p>
              <p className="text-sm text-gray-500">{session.user?.email}</p>
              <Button
                onClick={() => signOut()}
                className="mt-4 bg-red-500 w-full"
              >
                Sign Out
              </Button>
            </div>
          ) : (
            <p className="text-center">Not logged in</p>
          )}
        </DialogContent>
      </Dialog>
    </motion.nav>
  );
};
