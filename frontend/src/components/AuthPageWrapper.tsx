import React from "react";
import { AuthProvider } from "../utils/AuthContext";

interface AuthPageWrapperProps {
  children: React.ReactNode;
}

export function AuthPageWrapper({ children }: AuthPageWrapperProps) {
  return <AuthProvider>{children}</AuthProvider>;
}
