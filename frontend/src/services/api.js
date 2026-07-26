import axios from "axios";

// Base API URL configuration
const API = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "https://intelliviz-backend.onrender.com/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request Interceptor: Safely attach JWT Token if available
API.interceptors.request.use(
  (config) => {
    try {
      const storedUser = localStorage.getItem("intelliviz_user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      }
    } catch (error) {
      console.error("Error reading token from localStorage:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response Interceptor: Global Error Handling & Automatic Logout
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("intelliviz_user");
      if (
        typeof window !== "undefined" &&
        window.location.pathname !== "/login"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

// ==========================================
// 1. DATASET MANAGEMENT APIs
// ==========================================
export const uploadDataset = async (formData) => {
  const response = await API.post("/datasets/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getUserDatasets = async () => {
  const response = await API.get("/datasets");
  return response.data;
};

export const getDatasetById = async (id) => {
  const response = await API.get(`/datasets/${id}`);
  return response.data;
};

export const deleteDataset = async (id) => {
  const response = await API.delete(`/datasets/${id}`);
  return response.data;
};

export const cleanDataset = async (id, cleaningOptions) => {
  const response = await API.post(`/datasets/${id}/clean`, cleaningOptions);
  return response.data;
};

export const exportDatasetCSV = async (datasetId) => {
  const response = await API.get(`/datasets/${datasetId}/export/csv`, {
    responseType: "blob",
  });
  return response;
};

// ==========================================
// 2. AI INSIGHTS & ANALYTICS APIs
// ==========================================

export const getDatasetInsights = async (datasetId) => {
  const response = await API.post(`/datasets/${datasetId}/insights`);
  return response.data;
};

export const generateAiInsights = getDatasetInsights;

// ==========================================
// 3. EXECUTIVE REPORT MANAGEMENT APIs
// ==========================================
export const generateReport = async (datasetId, title) => {
  const response = await API.post("/reports/generate", { datasetId, title });
  return response.data;
};

export const getUserReports = async () => {
  const response = await API.get("/reports");
  return response.data;
};

export const getReportsByDataset = async (datasetId) => {
  const response = await API.get(`/reports/dataset/${datasetId}`);
  return response.data;
};

export const downloadReportFile = async (reportId) => {
  const response = await API.get(`/reports/${reportId}/download`, {
    responseType: "blob",
  });
  return response;
};

export const downloadReportHtml = downloadReportFile; // Alias

export const deleteReport = async (reportId) => {
  const response = await API.delete(`/reports/${reportId}`);
  return response.data;
};

// ==========================================
// 4. SAVED CHARTS APIs
// ==========================================
export const saveChart = async (chartData) => {
  const response = await API.post("/saved-charts", chartData);
  return response.data;
};

export const getSavedCharts = async (datasetId) => {
  const url = datasetId
    ? `/saved-charts?datasetId=${datasetId}`
    : "/saved-charts";
  const response = await API.get(url);
  return response.data;
};

export const deleteSavedChart = async (chartId) => {
  const response = await API.delete(`/saved-charts/${chartId}`);
  return response.data;
};

export default API;
