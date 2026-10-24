import { Navigate, useLocation } from "react-router-dom";

export default function ProtectedRoute({ children, hostOnly = false }) {
  const location = useLocation();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace state={{ message: "Please log in to continue.", from: location.pathname }} />;
  }
  if (hostOnly && role !== "host") {
    return <Navigate to="/become-a-host" replace />;
  }
  return children;
}b 