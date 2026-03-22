import api from "../components/api/axios";

export const register = (payload) =>
  api.post("/auth/register", payload);

export const login = (payload) =>
  api.post("/auth/login", payload);

// Logout — hapus data dari localStorage
export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
};
 
// Helper: ambil data user yang sedang login
export const getCurrentUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};
 
// Helper: cek apakah user sudah login
export const isAuthenticated = () => {
  return !!localStorage.getItem("token");
};