import { createContext, useContext, useState, useEffect } from "react";

const OccasionContext = createContext();

export const OCCASIONS = {
  EID_FITR: "eid-fitr",
  // RAMADAN: "ramadan",
  // FOUNDING_DAY: "founding-day",
};

// Theme configurations for each occasion
export const OCCASION_THEMES = {
  [OCCASIONS.EID_FITR]: {
    primary: "#0D7377",
    secondary: "#065F56",
    accent: "#D4AF37",
    lightBg: "from-[#F0FFF4] via-[#F5FFF9] to-[#FDF6E3]",
    darkBg: "from-[#031D1F] via-[#0D3B3E] to-[#031D1F]",
    lightBgImage: "/eid-light.jpg",
    darkBgImage: "/eid-dark.jpg",
    cardsPath: "/eid",
    logo: {
      light: "/eid/RHC.jpg",
      dark: "/eid/RHC.jpg",
    },
  },
  /*
  [OCCASIONS.RAMADAN]: {
    primary: "#1B3A5C",
    secondary: "#0F2641",
    accent: "#C9A84C",
    lightBg: "from-[#FFF8F0] via-[#FDF5EB] to-[#F5E6CC]",
    darkBg: "from-[#0F2641] via-[#1B3A5C] to-[#0F2641]",
    lightBgImage: "/ramadan-light.jpg",
    darkBgImage: "/ramadan-dark.jpg",
    cardsPath: "/cards",
    logo: {
      light: "/cards/RHC.jpg",
      dark: "/cards/RHC.jpg",
    },
  },
  [OCCASIONS.FOUNDING_DAY]: {
    primary: "#6B4E45",
    secondary: "#4A352F",
    accent: "#D4A574",
    lightBg: "from-[#FFF8F0] via-[#F5E6D3] to-[#E8D5C4]",
    darkBg: "from-[#2D1F1A] via-[#4A352F] to-[#2D1F1A]",
    lightBgImage: "/founding-day-light.jpg",
    darkBgImage: "/founding-day-dark.jpg",
    cardsPath: "/founding-day-cards",
    logo: {
      light: "/founding-day-logo-dark-theme.png",
      dark: "/founding-day-logo-light-theme.png",
    },
  },
  */
};

export const OccasionProvider = ({ children }) => {
  const [occasion, setOccasion] = useState(() => {
    // Auto-select Eid Al Fitr as the only active occasion
    return OCCASIONS.EID_FITR;
  });

  useEffect(() => {
    if (occasion) {
      localStorage.setItem("selectedOccasion", occasion);
    }
  }, [occasion]);

  const theme = occasion ? OCCASION_THEMES[occasion] : null;

  const clearOccasion = () => {
    localStorage.removeItem("selectedOccasion");
    setOccasion(null);
  };

  return (
    <OccasionContext.Provider
      value={{ occasion, setOccasion, theme, clearOccasion }}
    >
      {children}
    </OccasionContext.Provider>
  );
};

export const useOccasion = () => {
  const context = useContext(OccasionContext);
  if (!context) {
    throw new Error("useOccasion must be used within an OccasionProvider");
  }
  return context;
};
