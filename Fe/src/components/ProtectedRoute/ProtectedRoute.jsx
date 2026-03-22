import { Navigate } from "react-router-dom";

const getUser = () => {
  try {
    const user = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !user) return null;
    return JSON.parse(user);
  } catch {
    return null;
  }
};

// Route yang hanya bisa diakses jika SUDAH login
// allowedRoles: ["USER"] atau ["ADMIN"] atau ["USER", "ADMIN"]
export function ProtectedRoute({ children, allowedRoles }) {
  const user = getUser();

  // Belum login → redirect ke login
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Sudah login tapi role tidak sesuai
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Jika USER coba akses admin → ke dashboard user
    if (user.role === "USER") return <Navigate to="/dashboard" replace />;
    // Jika ADMIN coba akses user → ke dashboard admin
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}

// Jika sudah login → redirect sesuai role
export function GuestRoute({ children }) {
  const user = getUser();

  if (user) {
    if (user.role === "ADMIN") return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}