import api from "../components/api/axios";

// ===== USERS =====
export const getAllUsers = () =>
  api.get("/users");

export const getUserById = (id) =>
  api.get(`/users/${id}`);

export const deleteUser = (id) =>
  api.delete(`/users/${id}`);

// ===== VERIFICATION =====
export const getAllVerifications = (status) =>
  api.get('/verification/admin/list', { params: status ? { status } : {} });
 
export const reviewVerification = (id, payload) =>
  api.patch(`/verification/admin/review/${id}`, payload);