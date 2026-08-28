import { Navigate, Route, Routes } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";

import { useAdminAuth } from "./hooks/useAdminAuth.js";
import AdminShell from "./components/AdminShell.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import OccasionListPage from "./pages/OccasionListPage.jsx";
import DesignListPage from "./pages/DesignListPage.jsx";

/**
 * Entry point for the lazily-loaded admin chunk.
 *
 * The guard is a branch here rather than a redirect inside an effect. An
 * effect-based redirect renders the protected page for a frame before it
 * navigates away -- the same class of bug the public pages avoid by returning
 * <NotFoundPage /> from render instead of bouncing from a useEffect.
 *
 * Note that this gate is a convenience, not the security boundary. It decides
 * what to draw; row level security decides what the database will answer. A
 * signed-out visitor who edits their way past this sees empty lists and failed
 * writes, because every policy independently calls is_admin().
 */
const AdminRoutes = () => {
  const { t } = useTranslation();
  const { status, email, signIn, signOut } = useAdminAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Loader2 className="h-5 w-5 animate-spin text-ink-3" aria-hidden="true" />
        <span className="sr-only">{t("admin.loading")}</span>
      </div>
    );
  }

  if (status !== "admin") {
    return <LoginPage status={status} onSignIn={signIn} onSignOut={signOut} />;
  }

  return (
    <Routes>
      <Route element={<AdminShell email={email} onSignOut={signOut} />}>
        <Route index element={<Navigate to="/admin/occasions" replace />} />
        <Route path="occasions" element={<OccasionListPage />} />
        <Route path="designs" element={<DesignListPage />} />
        <Route path="*" element={<Navigate to="/admin/occasions" replace />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
