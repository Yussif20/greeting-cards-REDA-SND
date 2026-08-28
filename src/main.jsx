import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./i18n/index.js";
import App from "./App.jsx";
import { revalidate } from "./data/registryStore.js";

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

// After render, never awaited. The app is already usable from the bundled
// snapshot; this only swaps in newer content if there is any. A failure here
// -- offline, or a paused free-tier project -- is not an error condition.
revalidate();
