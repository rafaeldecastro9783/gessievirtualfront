// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { getAccessToken } from "../api/auth";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const token = getAccessToken();
  return token ? children : <Navigate to="/" replace />;
}
