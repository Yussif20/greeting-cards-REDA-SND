import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardGallery from "./components/CardGallery";
import CustomizationPage from "./components/CustomizationPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import OccasionSelector from "./components/OccasionSelector";
import {
  OccasionProvider,
  useOccasion,
  OCCASIONS,
} from "./context/OccasionContext";
import { useMemo } from "react";

const AppContent = () => {
  const { occasion } = useOccasion();

  // Dynamic background based on occasion
  const appClassName = useMemo(() => {
    // Eid Al Fitr theme (active)
    if (occasion === OCCASIONS.EID_FITR) {
      return "flex flex-col min-h-screen bg-gradient-to-br from-[#F0FFF4] to-[#FDF6E3] dark:from-[#031D1F] dark:to-[#0D3B3E] transition-colors duration-300";
    }
    // Fallback (same as Eid)
    return "flex flex-col min-h-screen bg-gradient-to-br from-[#F0FFF4] to-[#FDF6E3] dark:from-[#031D1F] dark:to-[#0D3B3E] transition-colors duration-300";
    /*
    // Ramadan theme
    // return "flex flex-col min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#F5E6CC] dark:from-[#070D18] dark:to-[#1B3A5C] transition-colors duration-300";
    // Founding Day theme
    // return "flex flex-col min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#E8D5C4] dark:from-[#2D1F1A] dark:to-[#4A352F] transition-colors duration-300";
    */
  }, [occasion]);

  return (
    <div className={appClassName}>
      <Header />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<OccasionSelector />} />
          <Route path="/welcome" element={<Home />} />
          <Route path="/cards" element={<CardGallery />} />
          <Route path="/customize" element={<CustomizationPage />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App = () => {
  return (
    <OccasionProvider>
      <Router>
        <AppContent />
      </Router>
    </OccasionProvider>
  );
};

export default App;
