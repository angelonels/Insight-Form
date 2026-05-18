import { Route, Routes } from "react-router-dom";

import { AppShell } from "../layouts/app-shell.js";
import { PublicFormShell } from "../layouts/public-form-shell.js";
import { DashboardPage } from "../pages/dashboard/dashboard-page.js";
import { LandingPage } from "../pages/landing/landing-page.js";
import { PublicFormClosedPage } from "../pages/public-form/public-form-closed-page.js";
import { PublicFormPage } from "../pages/public-form/public-form-page.js";
import { PublicFormThankYouPage } from "../pages/public-form/public-form-thank-you-page.js";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />

      <Route element={<AppShell />}>
        <Route path="/app" element={<DashboardPage />} />
      </Route>

      <Route element={<PublicFormShell />}>
        <Route path="/f/:publicSlug" element={<PublicFormPage />} />
        <Route path="/f/:publicSlug/thank-you" element={<PublicFormThankYouPage />} />
        <Route path="/f/:publicSlug/closed" element={<PublicFormClosedPage />} />
      </Route>
    </Routes>
  );
}

