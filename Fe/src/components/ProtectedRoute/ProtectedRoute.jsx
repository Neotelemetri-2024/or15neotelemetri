import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const getUser = () => {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const decoded = jwtDecode(token);
    // Cek token expired
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return null;
    }
    return { id: decoded.sub, email: decoded.email, role: decoded.role };
  } catch {
    return null;
  }
};

export function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "USER")  return <Navigate to="/dashboard" replace />;
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const user = getUser();

  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}