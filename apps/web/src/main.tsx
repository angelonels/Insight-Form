import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource-variable/newsreader";

import { AppProviders } from "./app/providers.js";
import { AppRouter } from "./app/router.js";
import "./styles/globals.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProviders>
      <AppRouter />
    </AppProviders>
  </React.StrictMode>,
);
