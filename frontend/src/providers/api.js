import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "https://cipherville.vercel.app"}/api`
});

export const attachSession = (userId, sessionToken) => {
  api.defaults.headers["x-user-id"] = userId;
  api.defaults.headers["x-session-token"] = sessionToken;
};

export default api;
