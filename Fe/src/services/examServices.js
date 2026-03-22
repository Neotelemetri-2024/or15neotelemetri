import api from "../components/api/axios"; // sesuaikan path

// Ambil exam yang tersedia sesuai sub divisi user yang login
export const getAvailableExams = () =>
  api.get("/exams/user/available");

// Mulai exam → return attempt + questions
export const startExam = (examId) =>
  api.post(`/exams/user/${examId}/start`);

// Submit jawaban
export const submitExam = (attemptId, answers) =>
  api.post(`/exams/user/attempts/${attemptId}/submit`, { answers });