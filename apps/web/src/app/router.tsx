import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import { ProtectedRoute } from "./protected-route.js";
import { LoadingState } from "../components/feedback/loading-state.js";
import { AppShell } from "../layouts/app-shell.js";
import { PublicFormShell } from "../layouts/public-form-shell.js";

const LandingPage = lazy(() => import("../pages/landing/landing-page.js").then((module) => ({ default: module.LandingPage })));
const DashboardPage = lazy(() => import("../pages/dashboard/dashboard-page.js").then((module) => ({ default: module.DashboardPage })));
const AiFormCreationPage = lazy(() =>
  import("../pages/ai-form-creation/ai-form-creation-page.js").then((module) => ({ default: module.AiFormCreationPage })),
);
const AiGeneratedFormPreviewPage = lazy(() =>
  import("../pages/ai-form-creation/ai-generated-form-preview-page.js").then((module) => ({
    default: module.AiGeneratedFormPreviewPage,
  })),
);
const FormEditorPage = lazy(() => import("../pages/form-editor/form-editor-page.js").then((module) => ({ default: module.FormEditorPage })));
const OwnerFormPreviewPage = lazy(() =>
  import("../pages/form-editor/owner-form-preview-page.js").then((module) => ({ default: module.OwnerFormPreviewPage })),
);
const InsightsPage = lazy(() => import("../pages/insights/insights-page.js").then((module) => ({ default: module.InsightsPage })));
const PublicFormPage = lazy(() => import("../pages/public-form/public-form-page.js").then((module) => ({ default: module.PublicFormPage })));
const PublicFormThankYouPage = lazy(() =>
  import("../pages/public-form/public-form-thank-you-page.js").then((module) => ({ default: module.PublicFormThankYouPage })),
);
const PublicFormClosedPage = lazy(() =>
  import("../pages/public-form/public-form-closed-page.js").then((module) => ({ default: module.PublicFormClosedPage })),
);
const ReportsListPage = lazy(() => import("../pages/reports/reports-list-page.js").then((module) => ({ default: module.ReportsListPage })));
const ReportPreviewPage = lazy(() => import("../pages/reports/report-preview-page.js").then((module) => ({ default: module.ReportPreviewPage })));
const ResponseInboxPage = lazy(() => import("../pages/responses/response-inbox-page.js").then((module) => ({ default: module.ResponseInboxPage })));
const ResponseDetailPage = lazy(() => import("../pages/responses/response-detail-page.js").then((module) => ({ default: module.ResponseDetailPage })));

export function AppRouter() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
        <Route path="/" element={<LandingPage />} />

        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/forms/new/ai" element={<AiFormCreationPage />} />
          <Route path="/app/forms/new/ai/preview/:generatedDraftId" element={<AiGeneratedFormPreviewPage />} />
          <Route path="/app/forms/:formId/editor" element={<FormEditorPage />} />
          <Route path="/app/forms/:formId/preview" element={<OwnerFormPreviewPage />} />
          <Route path="/app/forms/:formId/responses" element={<ResponseInboxPage />} />
          <Route path="/app/forms/:formId/responses/:responseId" element={<ResponseDetailPage />} />
          <Route path="/app/forms/:formId/insights" element={<InsightsPage />} />
          <Route path="/app/forms/:formId/reports" element={<ReportsListPage />} />
          <Route path="/app/forms/:formId/reports/:reportId" element={<ReportPreviewPage />} />
        </Route>

        <Route element={<PublicFormShell />}>
          <Route path="/f/:publicSlug" element={<PublicFormPage />} />
          <Route path="/f/:publicSlug/thank-you" element={<PublicFormThankYouPage />} />
          <Route path="/f/:publicSlug/closed" element={<PublicFormClosedPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function RouteLoading() {
  return (
    <main className="mx-auto min-h-[100dvh] max-w-3xl px-5 py-10">
      <LoadingState rows={2} />
    </main>
  );
}
