import api from "../components/api/axios";

// ── DEPARTMENT ──────────────────────────────────────────────────
export const getDepartments = () => api.get("/master-data/departments");
export const createDepartment = (data) => api.post("/master-data/departments", data);
export const updateDepartment = (id, data) => api.patch(`/master-data/departments/${id}`, data);
export const deleteDepartment = (id) => api.delete(`/master-data/departments/${id}`);

// ── DIVISION ────────────────────────────────────────────────────
export const getDivisions = (departmentId) =>
  api.get("/master-data/divisions", { params: departmentId ? { departmentId } : {} });
export const createDivision = (data) => api.post("/master-data/divisions", data);
export const updateDivision = (id, data) => api.patch(`/master-data/divisions/${id}`, data);
export const deleteDivision = (id) => api.delete(`/master-data/divisions/${id}`);

// ── SUB DIVISION ────────────────────────────────────────────────
export const getSubDivisions = (divisionId) =>
  api.get("/master-data/sub-divisions", { params: divisionId ? { divisionId } : {} });
export const createSubDivision = (data) => api.post("/master-data/sub-divisions", data);
export const updateSubDivision = (id, data) => api.patch(`/master-data/sub-divisions/${id}`, data);
export const deleteSubDivision = (id) => api.delete(`/master-data/sub-divisions/${id}`);