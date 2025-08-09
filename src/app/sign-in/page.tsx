"use client";

import React, { useState } from "react";
import { EyeIcon, EyeOff, GraduationCap, School } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFirebase } from "@/hooks/custom/use-firebase";

export default function SignInPage() {

  const {
    googleSignIn,
    emailPasswordSignIn,
    isGooglSigninLoading,
    isEmailPasswordLoading,
  } = useFirebase();

  return (
    <div className="from-primary/15 to-primary/5 flex min-h-screen items-center justify-center bg-gradient-to-br p-4">
      <Card className="w-full max-w-md p-6">
        <CardHeader className="space-y-2">
          <div className="mb-8 flex items-center justify-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center shadow-lg">
              <svg
                className="w-8 h-8 text-primary-foreground"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            Welcome Back
          </CardTitle>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="teacher">
            <TabsList>
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
            </TabsList>
            <TabsContent value="teacher">
              
            </TabsContent>
            <TabsContent value="student">
              
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center pt-4">
            <p className="text-xs text-muted-foreground">
              By continuing, you agree to our{" "}
              <Link href="#" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/privacy-policy"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
