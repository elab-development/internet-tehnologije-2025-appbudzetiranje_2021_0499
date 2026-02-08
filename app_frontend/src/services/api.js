// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:8000/api",
});

// Automatski dodaje token na svaki request
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token"); // ostaje kao kod tebe

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
