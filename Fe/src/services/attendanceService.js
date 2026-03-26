import api from "../components/api/axios";

// ── Activities ──────────────────────────────────────────────
export const getAllActivities = () =>
  api.get("/attendances/activities");

export const getActivityById = (id) =>
  api.get(`/attendances/activities/${id}`);

export const createActivity = (data) =>
  api.post("/attendances/activities", data);

export const updateActivity = (id, data) =>
  api.patch(`/attendances/activities/${id}`, data);

export const deleteActivity = (id) =>
  api.delete(`/attendances/activities/${id}`);

// ── Scan & Manual Update ────────────────────────────────────
export const scanAttendance = (data) =>
  api.post("/attendances/scan", data); // { userId, activityId }

export const updateAttendance = (attendanceId, data) =>
  api.patch(`/attendances/${attendanceId}`, data); // { status, notes }

// ── User ────────────────────────────────────────────────────
export const getMyAttendances = () =>
  api.get("/attendances/me");