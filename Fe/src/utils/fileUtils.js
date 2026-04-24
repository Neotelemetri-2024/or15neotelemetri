import api from "../components/api/axios";

export const getSecureFileUrl = async (apiEndpoint) => {
  try {
    // Ambil temporary file token dari backend
    const response = await api.get("/auth/file-token");
    const { file_token } = response.data;

    
    // Gabungkan dengan endpoint + token sebagai query param
    return `https://b3or15.neotelemetri.id/api${apiEndpoint}?token=${file_token}`;
  } catch (error) {
    console.error("Secure URL Error:", error);
    return null;
  }
};