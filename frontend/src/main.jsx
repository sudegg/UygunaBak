import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import axios from "axios";
import "./index.css";
import "leaflet/dist/leaflet.css";
import App from "./App.jsx";

const apiBase = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "");
if (apiBase) {
  axios.defaults.baseURL = apiBase;
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
