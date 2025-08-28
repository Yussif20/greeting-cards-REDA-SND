import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";
import {
  Download,
  Palette,
  Type,
  ChevronsUpDown,
  Wand2,
  Check,
  Loader2,
  ArrowLeft,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const CustomizationPage = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCard = location.state?.selectedCard;

  // Redirect to card gallery if no card is selected
  useEffect(() => {
    if (!selectedCard) {
      navigate("/cards");
    }
  }, [selectedCard, navigate]);

  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [namePosition, setNamePosition] = useState({ x: 540, y: 540 });
  const [font, setFont] = useState("Cairo");
  const [arabicFont, setArabicFont] = useState("Cairo");
  const [englishFont, setEnglishFont] = useState("Roboto");
  const [fontStyle, setFontStyle] = useState("normal");
  const [fontLanguage, setFontLanguage] = useState("arabic");
  const [fontSize, setFontSize] = useState(60);
  const [textShadow, setTextShadow] = useState(2);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  const previewRef = useRef(null);

  // Style presets
  const presets = useMemo(
    () => ({
      elegant: {
        color: "#4B2E39",
        font: "Amiri",
        fontStyle: "normal",
        fontSize: 85,
        textShadow: 3.5,
      },
      professional: {
        color: "#2C5234",
        font: "Cairo",
        fontStyle: "bold",
        fontSize: 75,
        textShadow: 2,
      },
      festive: {
        color: "#FFD700",
        font: "Scheherazade",
        fontStyle: "bold",
        fontSize: 90,
        textShadow: 4,
      },
    }),
    []
  );

  // Font configuration - Only fonts that are actually imported
  const fontConfig = useMemo(
    () => ({
      arabic: [
        "Cairo",
        "Amiri",
        "Tajawal",
        "Scheherazade",
        "Lateef",
        "Noto Naskh Arabic",
      ],
      english: ["Roboto", "Lora", "Playfair Display", "Arial"],
    }),
    []
  );

  // Load the selected card when component mounts
  useEffect(() => {
    if (selectedCard) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = selectedCard.src;

      img.onload = () => {
        setSelectedImage(img);
        setNamePosition({
          x: img.width / 2,
          y: img.height / 2,
        });
        setFontSize(80);
        setIsLoading(false);
      };

      img.onerror = () => {
        setError(t("image_load_error"));
        setSelectedImage(null);
        setIsLoading(false);
      };
    }
  }, [selectedCard, t]);

  // Font loading
  useEffect(() => {
    const loadFonts = async () => {
      setIsLoading(true);
      try {
        const cachedFonts = localStorage.getItem("loadedFonts");
        if (cachedFonts) {
          setFontsLoaded(true);
          setIsLoading(false);
          return;
        }

        // Fonts are already loaded via HTML link tag
        // Just wait for document.fonts.ready
        await Promise.race([
          document.fonts.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Font load timeout")), 3000)
          ),
        ]);

        localStorage.setItem("loadedFonts", "true");
        setFontsLoaded(true);
        setIsLoading(false);
      } catch (err) {
        console.error("Font loading error:", err);
        setError(t("font_load_error_retry"));
        setFontsLoaded(true);
        setIsLoading(false);
      }
    };

    loadFonts();
  }, [t]);

  // Update current font based on language selection
  useEffect(() => {
    if (fontLanguage === "arabic") {
      setFont(arabicFont);
    } else {
      setFont(englishFont);
    }
  }, [fontLanguage, arabicFont, englishFont]);

  // Save state to history
  const saveToHistory = useCallback(() => {
    const currentState = {
      name,
      color,
      namePosition,
      font,
      arabicFont,
      englishFont,
      fontStyle,
      fontLanguage,
      fontSize,
      textShadow,
    };
    setHistory((prev) => [...prev.slice(-9), currentState]);
  }, [
    name,
    color,
    namePosition,
    font,
    arabicFont,
    englishFont,
    fontStyle,
    fontLanguage,
    fontSize,
    textShadow,
  ]);

  // Undo functionality
  const undo = useCallback(() => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setName(lastState.name);
      setColor(lastState.color);
      setNamePosition(lastState.namePosition);
      setFont(lastState.font);
      if (lastState.arabicFont) setArabicFont(lastState.arabicFont);
      if (lastState.englishFont) setEnglishFont(lastState.englishFont);
      setFontStyle(lastState.fontStyle);
      setFontLanguage(lastState.fontLanguage);
      setFontSize(lastState.fontSize);
      setTextShadow(lastState.textShadow);
      setHistory((prev) => prev.slice(0, -1));
    }
  }, [history]);

  // Reset to defaults
  const reset = useCallback(() => {
    saveToHistory();
    setName("");
    setColor("#ffffff");
    setNamePosition({ x: 540, y: 540 });
    setFont("Cairo");
    setArabicFont("Cairo");
    setEnglishFont("Roboto");
    setFontStyle("normal");
    setFontLanguage("arabic");
    setFontSize(60);
    setTextShadow(2);
  }, [saveToHistory]);

  // Apply preset
  const applyPreset = useCallback(
    (presetName) => {
      const preset = presets[presetName];
      saveToHistory();
      setColor(preset.color);

      // Determine if the preset font is Arabic or English
      const isArabicFont = fontConfig.arabic.includes(preset.font);
      if (isArabicFont) {
        setArabicFont(preset.font);
        setFontLanguage("arabic");
      } else {
        setEnglishFont(preset.font);
        setFontLanguage("english");
      }

      setFontStyle(preset.fontStyle);
      setFontSize(preset.fontSize);
      setTextShadow(preset.textShadow);
    },
    [presets, saveToHistory, fontConfig]
  );

  // Update preview
  const updatePreview = useCallback(() => {
    if (!selectedImage || !previewRef.current || !fontsLoaded) return;

    const canvas = previewRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = selectedImage.width;
    canvas.height = selectedImage.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(selectedImage, 0, 0);

    if (name.trim()) {
      ctx.font = `${
        fontStyle === "bold"
          ? "bold"
          : fontStyle === "italic"
          ? "italic"
          : "normal"
      } ${fontSize}px "${font}", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (textShadow > 0) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = textShadow * 2;
        ctx.shadowOffsetX = textShadow;
        ctx.shadowOffsetY = textShadow;
      }

      ctx.fillText(name, namePosition.x, namePosition.y);
    }
  }, [
    selectedImage,
    name,
    color,
    namePosition,
    font,
    fontStyle,
    fontSize,
    textShadow,
    fontsLoaded,
  ]);

  // Debounced update preview
  const debouncedUpdatePreview = useMemo(
    () => debounce(updatePreview, 100),
    [updatePreview]
  );

  // Handle preview click
  const handlePreviewClick = useCallback(
    (e) => {
      if (!selectedImage) return;

      const canvas = previewRef.current;
      const rect = canvas.getBoundingClientRect();
      const scaleX = selectedImage.width / rect.width;
      const scaleY = selectedImage.height / rect.height;

      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;

      saveToHistory();
      setNamePosition({ x, y });
    },
    [selectedImage, saveToHistory]
  );

  // Download functionality
  const downloadCard = useCallback(async () => {
    if (!selectedImage || !name.trim()) {
      setError(t("enter_name_first"));
      return;
    }

    setActionLoading(true);
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = selectedImage.width;
      canvas.height = selectedImage.height;

      ctx.drawImage(selectedImage, 0, 0);

      ctx.font = `${
        fontStyle === "bold"
          ? "bold"
          : fontStyle === "italic"
          ? "italic"
          : "normal"
      } ${fontSize}px "${font}", sans-serif`;
      ctx.fillStyle = color;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (textShadow > 0) {
        ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
        ctx.shadowBlur = textShadow * 2;
        ctx.shadowOffsetX = textShadow;
        ctx.shadowOffsetY = textShadow;
      }

      ctx.fillText(name, namePosition.x, namePosition.y);

      const link = document.createElement("a");
      link.download = `saudi-national-day-${name.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (err) {
      console.error("Download error:", err);
      setError(t("download_error"));
    } finally {
      setActionLoading(false);
    }
  }, [
    selectedImage,
    name,
    color,
    namePosition,
    font,
    fontStyle,
    fontSize,
    textShadow,
    t,
  ]);

  // Update preview when dependencies change
  useEffect(() => {
    debouncedUpdatePreview();
  }, [debouncedUpdatePreview]);

  if (!selectedCard) {
    return null; // Will redirect to cards page
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-[#006C35]" />
      </div>
    );
  }

  return (
    <div className="relative bg-gradient-to-br from-[#f8fdf8] via-[#f0f8f0] to-[#e8f4e8] dark:from-[#004225] dark:via-[#006C35] dark:to-[#004225] min-h-screen bg-[url('/saudi-light.jpg')] dark:bg-[url('/saudi-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300">
      <div className="absolute inset-0 bg-white/5 dark:bg-black/30 transition-all duration-300"></div>

      <div className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/cards")}
            className="flex items-center gap-2 px-4 py-2 bg-white/60 dark:bg-gray-800/20 rounded-lg backdrop-blur-sm border border-white/70 dark:border-gray-700/30 hover:bg-white/80 dark:hover:bg-gray-800/30 transition-colors duration-200 text-gray-800 dark:text-gray-200"
          >
            <ArrowLeft className="h-5 w-5" />
            <span
              className={
                i18n.language === "ar" ? "font-elegant-ar" : "font-elegant-en"
              }
            >
              {t("back_to_cards")}
            </span>
          </button>
        </div>

        <AnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <div className="bg-white/60 dark:bg-gray-800/20 rounded-xl p-6 backdrop-blur-sm border border-white/70 dark:border-gray-700/30 shadow-xl">
              <h2
                className={`text-2xl font-bold text-[#001a0a] dark:text-[#F4E4BC] mb-6 ${
                  i18n.language === "ar" ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("guide_name")}
              </h2>

              {/* Name Input */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-[#003d15] dark:text-[#F4E4BC] mb-2 ${
                    i18n.language === "ar"
                      ? "font-elegant-ar"
                      : "font-elegant-en"
                  }`}
                >
                  {t("enter_name")}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white/80 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#006C35] focus:border-transparent text-gray-900 dark:text-gray-100"
                  placeholder={t("enter_name")}
                  dir={fontLanguage === "arabic" ? "rtl" : "ltr"}
                />
              </div>

              {/* Color Picker */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-[#003d15] dark:text-[#F4E4BC] mb-2 ${
                    i18n.language === "ar"
                      ? "font-elegant-ar"
                      : "font-elegant-en"
                  }`}
                >
                  {t("guide_color")}
                </label>
                <input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-full h-12 rounded-lg border border-gray-400 dark:border-gray-600 cursor-pointer"
                />
              </div>

              {/* Font Language Toggle */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-[#003d15] dark:text-[#F4E4BC] mb-2 ${
                    i18n.language === "ar"
                      ? "font-elegant-ar"
                      : "font-elegant-en"
                  }`}
                >
                  {t("font_language")}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFontLanguage("arabic")}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                      fontLanguage === "arabic"
                        ? "bg-gradient-to-r from-[#006C35] to-[#004225] text-white shadow-md"
                        : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {i18n.language === "ar" ? "عربي" : "Arabic"}
                  </button>
                  <button
                    onClick={() => setFontLanguage("english")}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                      fontLanguage === "english"
                        ? "bg-gradient-to-r from-[#006C35] to-[#004225] text-white shadow-md"
                        : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {i18n.language === "ar" ? "إنجليزي" : "English"}
                  </button>
                </div>
              </div>

              {/* Conditional Font Selector */}
              <div className="space-y-4 mb-6">
                {fontLanguage === "arabic" ? (
                  <div>
                    <label
                      className={`block text-sm font-medium text-[#003d15] dark:text-[#F4E4BC] mb-2 ${
                        i18n.language === "ar"
                          ? "font-elegant-ar"
                          : "font-elegant-en"
                      }`}
                    >
                      {t("arabic_font")}
                    </label>
                    <select
                      value={arabicFont}
                      onChange={(e) => {
                        setArabicFont(e.target.value);
                        setFont(e.target.value);
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white/80 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100"
                      style={{ fontFamily: arabicFont }}
                    >
                      {fontConfig.arabic.map((fontName) => (
                        <option
                          key={fontName}
                          value={fontName}
                          style={{ fontFamily: fontName }}
                        >
                          {fontName}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <label
                      className={`block text-sm font-medium text-[#003d15] dark:text-[#F4E4BC] mb-2 ${
                        i18n.language === "ar"
                          ? "font-elegant-ar"
                          : "font-elegant-en"
                      }`}
                    >
                      {t("english_font")}
                    </label>
                    <select
                      value={englishFont}
                      onChange={(e) => {
                        setEnglishFont(e.target.value);
                        setFont(e.target.value);
                      }}
                      className="w-full px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white/80 dark:bg-gray-900/50 text-gray-900 dark:text-gray-100"
                      style={{ fontFamily: englishFont }}
                    >
                      {fontConfig.english.map((fontName) => (
                        <option
                          key={fontName}
                          value={fontName}
                          style={{ fontFamily: fontName }}
                        >
                          {fontName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label
                    className={`block text-sm font-medium text-[#003d15] dark:text-[#F4E4BC] mb-2 ${
                      i18n.language === "ar"
                        ? "font-elegant-ar"
                        : "font-elegant-en"
                    }`}
                  >
                    {t("guide_font_size")}
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    value={fontSize}
                    onChange={(e) => setFontSize(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <span className="text-sm text-gray-800 dark:text-gray-400">
                    {fontSize}px
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {Object.keys(presets).map((presetName) => (
                    <button
                      key={presetName}
                      onClick={() => applyPreset(presetName)}
                      className={`px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#006C35] to-[#004225] hover:from-[#004225] hover:to-[#002d15] text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
                        i18n.language === "ar"
                          ? "font-elegant-ar"
                          : "font-elegant-en"
                      }`}
                    >
                      {t(presetName)}
                    </button>
                  ))}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={undo}
                    disabled={history.length === 0}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#8B4513] to-[#654321] hover:from-[#654321] hover:to-[#4a2c17] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-md hover:shadow-lg"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("undo")}
                  </button>
                  <button
                    onClick={reset}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[#D4A574] to-[#B8860B] hover:from-[#B8860B] hover:to-[#996f09] text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("reset")}
                  </button>
                </div>

                <button
                  onClick={downloadCard}
                  disabled={actionLoading || !name.trim()}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-[#006C35] to-[#FFD700] hover:from-[#004225] hover:to-[#DAA520] disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  {actionLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Download className="h-5 w-5" />
                  )}
                  {t("download_card")}
                </button>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white/60 dark:bg-gray-800/20 rounded-xl p-6 backdrop-blur-sm border border-white/70 dark:border-gray-700/30 shadow-xl">
              <h3
                className={`text-xl font-semibold text-[#001a0a] dark:text-[#F4E4BC] mb-4 ${
                  i18n.language === "ar" ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("card_preview")}
              </h3>

              <div className="relative">
                <canvas
                  ref={previewRef}
                  onClick={handlePreviewClick}
                  className="w-full max-w-md mx-auto border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg cursor-crosshair"
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: "center top",
                  }}
                />

                {!name.trim() && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <p
                      className={`text-gray-500 dark:text-gray-400 text-center ${
                        i18n.language === "ar"
                          ? "font-elegant-ar"
                          : "font-elegant-en"
                      }`}
                    >
                      {t("position_tip")}
                    </p>
                  </div>
                )}
              </div>

              {/* Zoom Controls */}
              <div className="flex justify-center gap-2 mt-4">
                <button
                  onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                  className="p-2 rounded-lg bg-white/40 dark:bg-white/20 hover:bg-white/60 dark:hover:bg-white/30 transition-colors duration-200 text-gray-800 dark:text-gray-200"
                >
                  <ZoomOut className="h-4 w-4" />
                </button>
                <span className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200 bg-white/30 dark:bg-gray-800/30 rounded-lg">
                  {Math.round(zoomLevel * 100)}%
                </span>
                <button
                  onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                  className="p-2 rounded-lg bg-white/40 dark:bg-white/20 hover:bg-white/60 dark:hover:bg-white/30 transition-colors duration-200 text-gray-800 dark:text-gray-200"
                >
                  <ZoomIn className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-2 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomizationPage;
