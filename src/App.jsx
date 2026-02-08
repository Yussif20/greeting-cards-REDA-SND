import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CardGallery from "./components/CardGallery";
import CustomizationPage from "./components/CustomizationPage";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./components/Home";
import { useMemo } from "react";

const App = () => {
  const appClassName = useMemo(
    () =>
      "flex flex-col min-h-screen bg-gradient-to-br from-[#FFF8F0] to-[#F5E6CC] dark:from-[#070D18] dark:to-[#1B3A5C] transition-colors duration-300",
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
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
};

export default App;
