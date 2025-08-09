import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  User,
} from "firebase/auth";
import { toast } from "sonner";

import { auth } from "@/lib/firebase";

export const useFirebase = () => {
  const [isGooglSigninLoading, setIsGoogleSigninLoading] = useState(false);
  const [isEmailPasswordLoading, setIsEmailPasswordLoading] = useState(false);
  const router = useRouter();

  const handlePostSignIn = (user: User, role?: string) => {
    // Set role in localStorage or cookie if provided
    if (role) {
      document.cookie = `authRole=${role}; path=/`;
      localStorage.setItem("userRole", role);
    }

    // Redirect based on role
    const userRole = role || localStorage.getItem("userRole") || "student";
    if (userRole === "teacher") {
      router.push("/");
    } else {
      router.push("/student-dashboard");
    }
  };

  return {
    googleSignIn: async (role?: string) => {
      setIsGoogleSigninLoading(true);
      try {
        const result = await signInWithPopup(auth, new GoogleAuthProvider());
        handlePostSignIn(result.user, role);
        toast.success("Successfully signed in");
      } catch (error: any) {
        toast.error(error.message || "Failed to sign in");
      } finally {
        setIsGoogleSigninLoading(false);
      }
    },
    emailPasswordSignIn: async (email: string, password: string) => {
      setIsEmailPasswordLoading(true);
      try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        handlePostSignIn(result.user);
        toast.success("Successfully signed in");
      } catch (error: any) {
        toast.error(error.message || "Failed to sign in");
      } finally {
        setIsEmailPasswordLoading(false);
      }
    },
    emailPasswordSignUp: async (email: string, password: string) => {
      setIsEmailPasswordLoading(true);
      try {
        const result = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        handlePostSignIn(result.user);
        toast.success("Account created successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to create account");
      } finally {
        setIsEmailPasswordLoading(false);
      }
    },
    logout: async () => {
      try {
        await signOut(auth);
        // Clear role data
        document.cookie =
          "authRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        localStorage.removeItem("userRole");
        router.push("/sign-in");
        toast.success("Successfully signed out");
      } catch (error: any) {
        toast.error(error.message || "Failed to sign out");
      }
    },
    isGooglSigninLoading,
    isEmailPasswordLoading,
  };
};
