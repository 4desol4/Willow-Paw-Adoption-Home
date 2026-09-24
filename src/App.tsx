import { lazy, Suspense, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { RequireOwner } from "@/components/layout/AdminShell";
import { Preloader, shouldShowIntro } from "@/components/layout/Preloader";
import { IntroContext } from "@/hooks/useIntro";
import { useSiteSettings } from "@/hooks/useSiteSettings";
import { useTheme } from "@/hooks/useTheme";
import HomePage from "@/pages/HomePage";

// Everything except the home page is split into its own chunk so the first visit stays light.
const PuppiesPage = lazy(() => import("@/pages/PuppiesPage"));
const PuppyDetailPage = lazy(() => import("@/pages/PuppyDetailPage"));
const AdoptedPage = lazy(() => import("@/pages/AdoptedPage"));
const AboutPage = lazy(() => import("@/pages/AboutPage"));
const TestimonialsPage = lazy(() => import("@/pages/TestimonialsPage"));
const ContactPage = lazy(() => import("@/pages/ContactPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
const LoginPage = lazy(() => import("@/pages/admin/LoginPage"));
const ResetPasswordPage = lazy(() => import("@/pages/admin/ResetPasswordPage"));
const DashboardPage = lazy(() => import("@/pages/admin/DashboardPage"));
const PuppiesAdminPage = lazy(() => import("@/pages/admin/PuppiesAdminPage"));
const PuppyEditorPage = lazy(() => import("@/pages/admin/PuppyEditorPage"));
const EnquiriesAdminPage = lazy(() => import("@/pages/admin/EnquiriesAdminPage"));
const TestimonialsAdminPage = lazy(() => import("@/pages/admin/TestimonialsAdminPage"));
const SettingsAdminPage = lazy(() => import("@/pages/admin/SettingsAdminPage"));

type Intro = "playing" | "leaving" | "done";

export default function App() {
  const location = useLocation();
  const { settings } = useSiteSettings();
  const { resolved } = useTheme();
  const [intro, setIntro] = useState<Intro>(() =>
    shouldShowIntro(location.pathname) ? "playing" : "done",
  );

  return (
    <IntroContext.Provider value={intro !== "playing"}>
      {intro !== "done" ? (
        <Preloader
          name={settings.site_name}
          onLeaving={() => setIntro("leaving")}
          onDone={() => setIntro("done")}
        />
      ) : null}
      <Toaster position="bottom-right" theme={resolved} closeButton />
      <Suspense fallback={<div className="min-h-screen" aria-busy="true" />}>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route index element={<HomePage />} />
            <Route path="puppies" element={<PuppiesPage />} />
            <Route path="puppies/:slug" element={<PuppyDetailPage />} />
            <Route path="adopted" element={<AdoptedPage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="testimonials" element={<TestimonialsPage />} />
            <Route path="contact" element={<ContactPage />} />
          </Route>

          <Route path="admin/login" element={<LoginPage />} />
          <Route path="admin/reset-password" element={<ResetPasswordPage />} />
          <Route path="admin" element={<RequireOwner />}>
            <Route index element={<DashboardPage />} />
            <Route path="puppies" element={<PuppiesAdminPage />} />
            <Route path="puppies/new" element={<PuppyEditorPage />} />
            <Route path="puppies/:id/edit" element={<PuppyEditorPage />} />
            <Route path="enquiries" element={<EnquiriesAdminPage />} />
            <Route path="testimonials" element={<TestimonialsAdminPage />} />
            <Route path="settings" element={<SettingsAdminPage />} />
          </Route>

          <Route element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </IntroContext.Provider>
  );
}
