import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

// --- ADD THESE LINES ---
import { Amplify } from "aws-amplify";
import outputs from "../amplify_outputs.json"; // Make sure this path is correct relative to main.jsx

Amplify.configure(outputs);
// -----------------------

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
