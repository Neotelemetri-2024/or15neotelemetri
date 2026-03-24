import api from "../components/api/axios"; // sesuaikan path

export const getAllTimelines  = ()         => api.get("/timelines");
export const createTimeline  = (data)     => api.post("/timelines", data);
export const updateTimeline  = (id, data) => api.patch(`/timelines/${id}`, data);
export const deleteTimeline  = (id)       => api.delete(`/timelines/${id}`);