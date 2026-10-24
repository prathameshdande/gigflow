import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ThemeProvider } from "./context/ThemeContext";
import { Toaster } from "react-hot-toast";

import "./main.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ThemeProvider>
      <App />
      {/* <Toaster/> */}
    </ThemeProvider>
  </BrowserRouter>,
);
