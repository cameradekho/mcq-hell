"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";

// Define user types based on your models
type TUser = {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "teacher" | "student";
  emailVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

type AuthContextType = {
  session: {
    user: TUser | null;
    token: string | null;
    loading: boolean;
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const FirebaseAuthProvider = ({ children }: AuthProviderProps) => {
  const router = useRouter();
  const [session, setSession] = useState<AuthContextType["session"]>({
    user: null,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && !session.user) {
        try {
          const token = await firebaseUser.getIdToken();

          // Get role from localStorage or cookie
          const roleFromStorage = localStorage.getItem("userRole");
          const roleFromCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("authRole="))
            ?.split("=")[1];

          const userRole = (roleFromStorage || roleFromCookie || "student") as
            | "teacher"
            | "student";

          // Create user object from Firebase user data
          const user: TUser = {
            _id: firebaseUser.uid,
            name:
              firebaseUser.displayName ||
              firebaseUser.email?.split("@")[0] ||
              "User",
            email: firebaseUser.email || "",
            avatar: firebaseUser.photoURL || "/images/cat-guest.png",
            role: userRole,
            emailVerified: firebaseUser.emailVerified,
            createdAt: firebaseUser.metadata.creationTime
              ? new Date(firebaseUser.metadata.creationTime)
              : new Date(),
            updatedAt: new Date(),
          };

          setSession({
            user,
            token,
            loading: false,
          });
        } catch (e) {
          console.error("[AuthProvider] Error processing user auth", e);
          toast.error("Authentication error occurred!");
          await signOut(auth);
          setSession({ user: null, token: null, loading: false });
        }
      } else if (!firebaseUser) {
        setSession({ user: null, token: null, loading: false });
      }
    });

    return unsubscribe;
  }, [router, session.user]);

  return (
    <AuthContext.Provider
      value={{
        session,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
