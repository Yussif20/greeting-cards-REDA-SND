import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/index.js";
import App from "./App.jsx";

// One-time cleanup: the previous build wrote this key and never read it back.
try {
  localStorage.removeItem("selectedOccasion");
} catch {
  // Private mode or blocked storage -- nothing to clean up.
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
