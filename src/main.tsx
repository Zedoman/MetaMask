import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
import { initializeMetaMask } from "./lib/metamask";

TempoDevtools.init();

// Initialize MetaMask immediately
initializeMetaMask();

// Also initialize after DOM is loaded as a fallback
document.addEventListener("DOMContentLoaded", () => {
  // Check if window.ethereum exists (MetaMask extension)
  if (window.ethereum) {
    console.log("MetaMask extension detected");
  } else {
    console.log("No MetaMask extension detected, using SDK");
    initializeMetaMask();
  }
});

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
