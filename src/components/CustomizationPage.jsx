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
  Share2,
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
import { useOccasion, OCCASIONS } from "../context/OccasionContext";

const CustomizationPage = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const selectedCard = location.state?.selectedCard;
  const { occasion } = useOccasion();

  // Redirect to card gallery if no card is selected or no occasion
  useEffect(() => {
    if (!selectedCard) {
      navigate("/cards");
    }
    if (!occasion) {
      navigate("/");
    }
  }, [selectedCard, occasion, navigate]);

  const isFoundingDay = occasion === OCCASIONS.FOUNDING_DAY;

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
        color: "#F0DFC8",
        font: "Amiri",
        fontStyle: "normal",
        fontSize: 80,
        textShadow: 2,
      },
      professional: {
        color: "#FFFFFF",
        font: "Cairo",
        fontStyle: "bold",
        fontSize: 72,
        textShadow: 1,
      },
      festive: {
        color: "#FFD700",
        font: "Scheherazade",
        fontStyle: "bold",
        fontSize: 88,
        textShadow: 4,
      },
    }),
    [],
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
    [],
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
        await document.fonts.ready;

        // Explicitly load all font variants so canvas can use them
        const allFonts = [...fontConfig.arabic, ...fontConfig.english];
        const loadPromises = allFonts.flatMap((f) => [
          document.fonts.load(`normal 48px "${f}"`).catch(() => {}),
          document.fonts.load(`bold 48px "${f}"`).catch(() => {}),
        ]);
        await Promise.all(loadPromises);

        setFontsLoaded(true);
      } catch (err) {
        console.error("Font loading error:", err);
        setFontsLoaded(true);
      } finally {
        setIsLoading(false);
      }
    };

    loadFonts();
  }, [t, fontConfig]);

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
    [presets, saveToHistory, fontConfig],
  );

  // Update preview
  const updatePreview = useCallback(() => {
    if (!selectedImage || !previewRef.current || !fontsLoaded) return;

    const canvas = previewRef.current;
    const ctx = canvas.getContext("2d");

    canvas.width = selectedImage.width;
    canvas.height = selectedImage.height;

    const fontWeight =
      fontStyle === "bold"
        ? "bold"
        : fontStyle === "italic"
          ? "italic"
          : "normal";

    const drawContent = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(selectedImage, 0, 0);

      if (name.trim()) {
        ctx.font = `${fontWeight} ${fontSize}px "${font}", sans-serif`;
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
    };

    // Ensure the specific font variant is loaded before drawing
    document.fonts
      .load(`${fontWeight} ${fontSize}px "${font}"`)
      .then(drawContent)
      .catch(drawContent);
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
    [updatePreview],
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
    [selectedImage, saveToHistory],
  );

  // Download functionality
  const downloadCard = useCallback(async () => {
    if (!selectedImage || !name.trim()) {
      setError(t("enter_name_first"));
      return;
    }

    setActionLoading(true);
    try {
      const fontWeight =
        fontStyle === "bold"
          ? "bold"
          : fontStyle === "italic"
            ? "italic"
            : "normal";

      // Ensure font is loaded before rendering the download
      await document.fonts
        .load(`${fontWeight} ${fontSize}px "${font}"`)
        .catch(() => {});

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = selectedImage.width;
      canvas.height = selectedImage.height;

      ctx.drawImage(selectedImage, 0, 0);

      ctx.font = `${fontWeight} ${fontSize}px "${font}", sans-serif`;
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
      link.download = `ramadan-greeting-${name.replace(/\s+/g, "-")}.png`;
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

  // Share functionality
  const shareCard = useCallback(async () => {
    if (!selectedImage || !name.trim()) {
      setError(t("enter_name_first"));
      return;
    }

    setActionLoading(true);
    try {
      const fontWeight =
        fontStyle === "bold"
          ? "bold"
          : fontStyle === "italic"
            ? "italic"
            : "normal";

      await document.fonts
        .load(`${fontWeight} ${fontSize}px "${font}"`)
        .catch(() => {});

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      canvas.width = selectedImage.width;
      canvas.height = selectedImage.height;

      ctx.drawImage(selectedImage, 0, 0);

      ctx.font = `${fontWeight} ${fontSize}px "${font}", sans-serif`;
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

      const blob = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png"),
      );
      const file = new File(
        [blob],
        `ramadan-greeting-${name.replace(/\s+/g, "-")}.png`,
        { type: "image/png" },
      );

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: t("share_card"),
          text: t("share_message"),
          files: [file],
        });
      } else {
        const shareText = encodeURIComponent(t("share_message"));
        window.open(
          `https://api.whatsapp.com/send?text=${shareText}`,
          "_blank",
        );
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error("Share error:", err);
        setError(t("share_error"));
      }
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

  if (!selectedCard || !occasion) {
    return null; // Will redirect
  }

  // Dynamic background classes based on occasion
  const bgClasses = isFoundingDay
    ? "from-[#FFF8F0] via-[#F5E6D3] to-[#E8D5C4] dark:from-[#2D1F1A] dark:via-[#4A352F] dark:to-[#2D1F1A] bg-[url('/founding-day-light.jpg')] dark:bg-[url('/founding-day-dark.jpg')]"
    : "from-[#FFF8F0] via-[#FDF5EB] to-[#F5E6CC] dark:from-[#0F2641] dark:via-[#1B3A5C] dark:to-[#0F2641] bg-[url('/ramadan-light.jpg')] dark:bg-[url('/ramadan-dark.jpg')]";

  // Dynamic primary colors for buttons
  const primaryGradient = isFoundingDay
    ? "from-[#6B4E45] to-[#4A352F] hover:from-[#7A5A50] hover:to-[#5A453F]"
    : "from-[#1B3A5C] to-[#0F2641] hover:from-[#0F2641] hover:to-[#070D18]";

  const accentGradient = isFoundingDay
    ? "from-[#6B4E45] to-[#D4A574] hover:from-[#4A352F] hover:to-[#B8906A]"
    : "from-[#1B3A5C] to-[#C9A84C] hover:from-[#0F2641] hover:to-[#A68A3E]";

  const loaderColor = isFoundingDay ? "text-[#6B4E45]" : "text-[#1B3A5C]";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className={`h-8 w-8 animate-spin ${loaderColor}`} />
      </div>
    );
  }

  return (
    <div
      className={`relative bg-linear-to-br ${bgClasses} min-h-screen bg-cover bg-no-repeat bg-center transition-all duration-300`}
    >
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
                className={`text-2xl font-bold text-[#0A1A2E] dark:text-[#F5E6CC] mb-6 ${
                  i18n.language === "ar" ? "font-elegant-ar" : "font-elegant-en"
                }`}
              >
                {t("guide_name")}
              </h2>

              {/* Name Input */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-[#132E4A] dark:text-[#F5E6CC] mb-2 ${
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
                  className="w-full px-4 py-2 rounded-lg border border-gray-400 dark:border-gray-600 bg-white/80 dark:bg-gray-900/50 focus:ring-2 focus:ring-[#1B3A5C] focus:border-transparent text-gray-900 dark:text-gray-100"
                  placeholder={t("enter_name")}
                  dir={fontLanguage === "arabic" ? "rtl" : "ltr"}
                />
              </div>

              {/* Color Picker */}
              <div className="mb-6">
                <label
                  className={`block text-sm font-medium text-[#132E4A] dark:text-[#F5E6CC] mb-2 ${
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
                  className={`block text-sm font-medium text-[#132E4A] dark:text-[#F5E6CC] mb-2 ${
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
                        ? `bg-linear-to-r ${primaryGradient} text-white shadow-md`
                        : "bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
                    }`}
                  >
                    {i18n.language === "ar" ? "عربي" : "Arabic"}
                  </button>
                  <button
                    onClick={() => setFontLanguage("english")}
                    className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 ${
                      fontLanguage === "english"
                        ? `bg-linear-to-r ${primaryGradient} text-white shadow-md`
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
                      className={`block text-sm font-medium text-[#132E4A] dark:text-[#F5E6CC] mb-2 ${
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
                      className={`block text-sm font-medium text-[#132E4A] dark:text-[#F5E6CC] mb-2 ${
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
                    className={`block text-sm font-medium text-[#132E4A] dark:text-[#F5E6CC] mb-2 ${
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
                      className={`px-3 py-2 text-sm rounded-lg bg-linear-to-r ${primaryGradient} text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 ${
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
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r ${primaryGradient} disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white transition-all duration-200 shadow-md hover:shadow-lg`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("undo")}
                  </button>
                  <button
                    onClick={reset}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-linear-to-r ${isFoundingDay ? "from-[#D4A574] to-[#B8906A] hover:from-[#B8906A] hover:to-[#9D7A5A]" : "from-[#C9A84C] to-[#A68A3E] hover:from-[#A68A3E] hover:to-[#8B7333]"} text-white transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("reset")}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={downloadCard}
                    disabled={actionLoading || !name.trim()}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r ${accentGradient} disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Download className="h-5 w-5" />
                    )}
                    {t("download_card")}
                  </button>
                  <button
                    onClick={shareCard}
                    disabled={actionLoading || !name.trim()}
                    className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg bg-linear-to-r ${accentGradient} disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105`}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <Share2 className="h-5 w-5" />
                    )}
                    {t("share_card")}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="bg-white/60 dark:bg-gray-800/20 rounded-xl p-6 backdrop-blur-sm border border-white/70 dark:border-gray-700/30 shadow-xl">
              <h3
                className={`text-xl font-semibold text-[#0A1A2E] dark:text-[#F5E6CC] mb-4 ${
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
