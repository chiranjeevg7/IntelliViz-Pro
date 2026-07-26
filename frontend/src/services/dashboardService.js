import API from "./api";

export const getDashboards = async () => {
  const response = await API.get("/dashboards");
  return response.data;
};

export const getDashboardById = async (id) => {
  const response = await API.get(`/dashboards/${id}`);
  return response.data;
};

export const createDashboard = async (dashboardData) => {
  const response = await API.post("/dashboards", dashboardData);
  return response.data;
};

export const updateDashboard = async (id, dashboardData) => {
  const response = await API.put(`/dashboards/${id}`, dashboardData);
  return response.data;
};

export const deleteDashboard = async (id) => {
  const response = await API.delete(`/dashboards/${id}`);
  return response.data;
};
