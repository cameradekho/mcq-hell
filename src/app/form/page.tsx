"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import AuthButtonsTeacher from "@/components/auth/teacher-auth-button";
import StudentAuthButton from "@/components/auth/student-auth-button";
import Link from "next/link";

export default function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
    }, 2000);
  };

  // Show loading while checking session status
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Main Auth Card */}
        <Card className="border-border/50 shadow-2xl backdrop-blur-sm bg-card/95 transform transition-all duration-500 hover:shadow-3xl animate-in fade-in-50 slide-in-from-bottom-10">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-primary/70 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
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
            <CardTitle className="text-2xl font-bold text-foreground">
              Welcome Back
            </CardTitle>
            <CardDescription className="text-muted-foreground text-base">
              Choose your role to continue to the application
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Role Selection */}
            <div className="space-y-3">
              <AuthButtonsTeacher />
              <StudentAuthButton />
            </div>

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

        {/* Bottom decoration */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground/60">
            Secure authentication powered by Google
          </p>
        </div>
      </div>
    </div>
  );
}
