import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/layout/Header.jsx";
import Footer from "./components/layout/Footer.jsx";
import ScrollToTop from "./components/layout/ScrollToTop.jsx";
import OccasionsPage from "./pages/OccasionsPage.jsx";
import DesignsPage from "./pages/DesignsPage.jsx";
import EditorPage from "./pages/EditorPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

const App = () => (
  <BrowserRouter>
    <ScrollToTop />
    <div className="flex min-h-screen flex-col bg-surface">
      <Header />
      <main className="flex-1">
        <Routes>
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
        </Routes>
      </main>
      <Footer />
    </div>
  </BrowserRouter>
);

export default App;
