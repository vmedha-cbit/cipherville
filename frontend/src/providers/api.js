import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:4000"}/api`
});

export const attachSession = (userId, sessionToken) => {
  api.defaults.headers["x-user-id"] = userId;
  api.defaults.headers["x-session-token"] = sessionToken;
};

export default api;
