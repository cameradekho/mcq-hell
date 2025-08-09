"use client";

import { ReactNode } from "react";
import { FirebaseAuthProvider } from "@/context/auth-provider";

type AuthProviderProps = {
  children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>;
}
