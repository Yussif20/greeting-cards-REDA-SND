import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardSelector from "./components/CardSelector";
import CardGallery from "./components/CardGallery";
import CustomizationPage from "./components/CustomizationPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import { useMemo } from "react";

const App = () => {
  const appClassName = useMemo(
    () =>
      "flex flex-col min-h-screen bg-gradient-to-br from-[#E8F5E8] to-[#F4E4BC] dark:from-[#004225] dark:to-[#006C35] transition-colors duration-300",
    []
  );

  return (
    <Router>
      <div className={appClassName}>
        <Header />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cards" element={<CardGallery />} />
            <Route path="/customize" element={<CustomizationPage />} />
            {/* Keep the old route for backward compatibility */}
            <Route path="/cards-old" element={<CardSelector />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
