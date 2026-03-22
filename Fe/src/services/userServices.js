import api from "../components/api/axios";

// ===== PROFILE =====
export const getMyProfile = () =>
  api.get("/profile/me");

export const updateMyProfile = (payload) =>
  api.patch("/profile/me", payload);

export const updateAvatar = (formData) =>
  api.post("/profile/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getDepartments = () =>
  api.get("/profile/departments");

export const getDivisionsByDepartment = (departmentId) =>
  api.get(`/profile/divisions/${departmentId}`);

export const getSubDivisionsByDivision = (divisionId) =>
  api.get(`/profile/sub-divisions/${divisionId}`);

// ===== TIMELINE =====
export const getTimelines = () =>
  api.get("/timelines");

// ===== VERIFICATION =====
export const getMyVerification = () =>
  api.get("/verification/me");

// formData adalah FormData — support file upload + twibbonLink
export const submitVerification = (formData) =>
  api.post("/verification/submit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });