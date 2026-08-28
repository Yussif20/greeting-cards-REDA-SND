import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import OccasionsPage from "./pages/OccasionsPage.jsx";
import DesignsPage from "./pages/DesignsPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

/**
 * The admin is a separate chunk, and that boundary is load-bearing.
 *
 * @supabase/supabase-js must never reach the public bundle. The site reads its
 * registry as a plain JSON file over fetch(), so a visitor who never opens
 * /admin downloads none of the client, none of its auth machinery, and none of
 * the admin screens. Making this a static import would undo that silently --
 * nothing would break, the bundle would just quietly grow for everyone.
 */
const AdminRoutes = lazy(() => import("./admin/AdminRoutes.jsx"));

/** The public frame: a flex column all the way down, so a page can opt into
    filling exactly one viewport without relying on percentage heights. */
const PublicLayout = () => (
  <div className="flex min-h-screen flex-col bg-surface">
    <Header />
    <main className="flex min-h-0 flex-1 flex-col">
      <Outlet />
    </main>
    <Footer />
  </div>
);

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <Routes>
      {/* Static segments outrank dynamic ones in react-router, so /admin is
          reached rather than being swallowed by /:occasion. */}
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<div className="min-h-screen bg-surface" />}>
            <AdminRoutes />
          </Suspense>
        }
      />

      <Route element={<PublicLayout />}>
        <Route path="/" element={<OccasionsPage />} />
        <Route path="/:occasion" element={<DesignsPage />} />
        <Route path="/:occasion/:designId" element={<EditorPage />} />

        {/* Legacy routes. They go to the index rather than guessing an
            occasion -- silently teleporting someone into last season's
            occasion is worse than showing them the choice. */}
        <Route path="/welcome" element={<Navigate to="/" replace />} />
        <Route path="/cards" element={<Navigate to="/" replace />} />
        <Route path="/customize" element={<Navigate to="/" replace />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </BrowserRouter>
);

export default App;
