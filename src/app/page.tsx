"use client";

import React, { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { addUser } from "../action/add-user";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import "@fontsource/poppins";
import "@fontsource/rubik";
import { AllExams } from "@/components/all-exams";
import { TopNavigationBar } from "@/components/top-navigation-bar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { PlusCircle, BookOpen, Settings, Activity } from "lucide-react";
import Link from "next/link";
import { fetchDashboardStats } from "../action/fetch-dashboard-stats";
import AuthButtons from "@/components/auth/auth-buttons";

export default function Home() {
  const { data: session } = useSession();
  const hasRun = useRef(false);
  const [stats, setStats] = useState({
    totalExams: 0,
    activeExams: 0,
    pendingReviews: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

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
            role: session.user.role,
          });

          if (result.success) {
            toast.success("User added successfully!");
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

  useEffect(() => {
    const fetchStats = async () => {
      if (session?.user?.email) {
        try {
          setIsLoading(true);
          const result = await fetchDashboardStats(session.user.email);
          if (result.success && result.data) {
            setStats(result.data);
          }
        } catch (error) {
          console.error("Error fetching stats:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNavigationBar />

      <main className="flex-grow py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {session ? (
            <div className="space-y-6">
              {/* Dashboard Header */}
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-semibold text-foreground">
                  Dashboard
                </h1>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <BookOpen className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total Exams
                        </p>
                        <h3 className="text-2xl font-bold">
                          {isLoading ? "Loading..." : stats.totalExams}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Activity className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Active Exams
                        </p>
                        <h3 className="text-2xl font-bold">
                          {isLoading ? "Loading..." : stats.activeExams}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <Settings className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Pending Reviews
                        </p>
                        <h3 className="text-2xl font-bold">
                          {isLoading ? "Loading..." : stats.pendingReviews}
                        </h3>
                      </div>
                    </div>
                  </CardContent>
                </Card> */}
              </div>

              <AllExams
                teacherEmail={session.user.email || ""}
                onExamDeleted={() => {
                  // Refresh dashboard stats when an exam is deleted
                  if (session?.user?.email) {
                    fetchDashboardStats(session.user.email)
                      .then((result) => {
                        if (result.success && result.data) {
                          setStats(result.data);
                        }
                      })
                      .catch((error) => {
                        console.error("Error refreshing stats:", error);
                      });
                  }
                }}
              />
            </div>
          ) : (
            <div className="space-y-20">
              {/* Hero Section */}
              <div className="text-center py-20 bg-gradient-to-b from-background to-secondary/10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="max-w-3xl mx-auto px-4"
                >
                  <h1 className="text-5xl font-bold text-foreground mb-6 font-rubik">
                    Welcome to ExamHell
                  </h1>
                  <p className="text-xl text-muted-foreground mb-8 font-poppins">
                    The ultimate platform for creating, managing, and grading
                    exams with ease. Streamline your assessment process and
                    focus on what matters most - teaching.
                  </p>
                  <AuthButtons
                    props={{
                      signInbtnText: "Get Started Now",
                      signOutbtnText: "Sign Out",
                    }}
                  />
                </motion.div>
              </div>

              {/* Features Section */}
              <div className="py-20 bg-background">
                <div className="max-w-7xl mx-auto px-4">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    Why Choose ExamHell?
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <PlusCircle className="h-8 w-8 text-primary mb-4" />
                        <CardTitle>Easy Exam Creation</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Create professional exams in minutes with our
                          intuitive interface. Multiple question types,
                          automatic grading, and customizable templates.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <BookOpen className="h-8 w-8 text-primary mb-4" />
                        <CardTitle>Progress Tracking</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Monitor student performance with detailed analytics.
                          Generate reports and identify areas for improvement.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <Settings className="h-8 w-8 text-primary mb-4" />
                        <CardTitle>Advanced Settings</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground">
                          Customize every aspect of your exams. Time limits,
                          question randomization, and anti-cheating measures.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Testimonials Section */}
              <div className="py-20 bg-secondary/10">
                <div className="max-w-7xl mx-auto px-4">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    What Teachers Say
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card>
                      <CardContent className="p-6">
                        <p className="italic mb-4">
                          "ExamHell has revolutionized how I manage assessments.
                          It's saved me countless hours and improved my
                          students' experience."
                        </p>
                        <p className="font-semibold">- Sarah Johnson</p>
                        <p className="text-sm text-muted-foreground">
                          Mathematics Professor
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <p className="italic mb-4">
                          "The analytics and reporting features are incredible.
                          I can easily track progress and identify areas where
                          students need help."
                        </p>
                        <p className="font-semibold">- Michael Chen</p>
                        <p className="text-sm text-muted-foreground">
                          Computer Science Instructor
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div className="py-20 bg-secondary/10">
                <div className="max-w-3xl mx-auto px-4">
                  <h2 className="text-3xl font-bold text-center mb-12">
                    Frequently Asked Questions
                  </h2>
                  <div className="space-y-6">
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">
                          How secure are the exams?
                        </h3>
                        <p className="text-muted-foreground">
                          We implement multiple security measures including
                          encryption, anti-cheating detection, and secure
                          browser modes to ensure exam integrity.
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-6">
                        <h3 className="font-semibold mb-2">
                          Can I import existing questions?
                        </h3>
                        <p className="text-muted-foreground">
                          Yes! ExamHell supports importing questions from
                          various formats including Word, Excel, and other
                          popular exam platforms.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* CTA Section */}
              <div className="py-20 bg-primary text-primary-foreground text-center">
                <div className="max-w-3xl mx-auto px-4">
                  <h2 className="text-3xl font-bold mb-6">
                    Ready to Get Started?
                  </h2>
                  <p className="text-xl mb-8">
                    Join thousands of educators who trust ExamHell for their
                    assessment needs.
                  </p>
                  <Button size="lg" variant="secondary">
                    Sign Up Now
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
