// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../api/auth";
// import React from "react";
import { ReactNode } from "react";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const token = getAccessToken();
  return token ? children : <Navigate to="/" replace />;
}
