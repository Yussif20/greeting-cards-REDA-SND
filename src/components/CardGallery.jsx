import React from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getAllCards } from "../data";
import AnimatedSection from "./AnimatedSection";

const CardGallery = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isArabic = i18n.language === "ar";
  const cards = getAllCards();

  const handleCardSelect = (card) => {
    // Navigate to customization page with selected card
    navigate("/customize", { state: { selectedCard: card } });
  };

  return (
    <div
      className="relative bg-gradient-to-br from-[#FFF8F0] via-[#FDF5EB] to-[#F5E6CC] dark:from-[#0F2641] dark:via-[#1B3A5C] dark:to-[#0F2641] min-h-screen bg-[url('/ramadan-light.jpg')] dark:bg-[url('/ramadan-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-white/5 dark:bg-black/30 transition-all duration-300"></div>

      <div className="container mx-auto px-4 py-12 lg:px-8 lg:py-16 max-w-7xl relative z-10">
        <AnimatedSection>
          <div className="text-center mb-12">
            <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg rounded-2xl p-6 sm:p-8 shadow-xl border border-white/60 dark:border-gray-700/40">
              <h1
                className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-[#0A1A2E] dark:text-white mb-4 animate-slide-up ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("select_card")}
              </h1>
              <p
                className={`text-lg sm:text-xl lg:text-2xl text-[#132E4A] dark:text-[#F5E6CC] mb-2 animate-slide-up delay-100 font-medium ${
                  isArabic ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                🌙 {t("ramadan_greeting")}
              </p>
            </div>
          </div>

          {/* Card Grid */}
          <div className="bg-white/10 dark:bg-gray-800/20 rounded-xl p-6 sm:p-8 backdrop-blur-sm border border-white/60 dark:border-gray-700/30 shadow-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, index) => (
                <div
                  key={index}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                  onClick={() => handleCardSelect(card)}
                >
                  <div className="relative overflow-hidden rounded-lg bg-white/10 dark:bg-gray-900/20 backdrop-blur-sm border border-white/80 dark:border-gray-700/40 shadow-lg">
                    <div className="relative p-4">
                      <img
                        src={card.src}
                        alt={card.name}
                        className="w-full h-auto object-contain rounded-lg transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                      {/* Overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center">
                        <div className="p-4 text-center">
                          <button
                            className={`px-6 py-2 bg-[#1B3A5C] hover:bg-[#0F2641] text-white rounded-lg font-medium transition-colors duration-200 ${
                              isArabic ? "font-elegant-ar" : "font-elegant-en"
                            }`}
                          >
                            {t("customize_card")}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-white/50 dark:bg-gray-900/40">
                      <h3
                        className={`text-lg font-semibold text-[#0F2641] dark:text-[#F5E6CC] text-center ${
                          isArabic ? "font-elegant-ar" : "font-elegant-en"
                        }`}
                      >
                        {card.name}
                      </h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </AnimatedSection>
      </div>
    </div>
  );
};

export default CardGallery;
