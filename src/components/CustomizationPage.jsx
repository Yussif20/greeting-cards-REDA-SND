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
import { EightPointStar, PanelCorners, StarDivider } from "./Ornaments";

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

  // const isEidAdha = occasion === OCCASIONS.EID_ADHA;
  // const isFoundingDay = occasion === OCCASIONS.FOUNDING_DAY;

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
      link.download = `eid-greeting-${name.replace(/\s+/g, "-")}.png`;
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
        `eid-greeting-${name.replace(/\s+/g, "-")}.png`,
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

  const isArabic = i18n.language === "ar";
  const labelFont = isArabic ? "font-display-ar" : "font-display-en";

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[var(--background)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--jewel-gold)]" />
      </div>
    );
  }

  // Section heading — small uppercase Cinzel + hairline rule.
  const SectionLabel = ({ children }) => (
    <label
      className={`block text-xs uppercase tracking-[0.2em] text-[var(--jewel-gold)] mb-3 ${labelFont}`}
    >
      {children}
    </label>
  );

  return (
    <div
      className="relative min-h-screen bg-[url('/eid-light.jpg')] dark:bg-[url('/eid-dark.jpg')] bg-cover bg-no-repeat bg-center transition-all duration-300"
      dir={isArabic ? "rtl" : "ltr"}
    >
      <div className="absolute inset-0 jewel-overlay-light dark:jewel-overlay-dark transition-all duration-300" />

      <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl relative z-10">
        {/* Back button */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/cards")}
            className={`inline-flex items-center gap-2 px-5 py-2 text-sm uppercase tracking-[0.18em] text-[var(--chrome-text)] border border-[var(--chrome-border)] hover:bg-[var(--chrome-border)]/10 transition-all duration-300 rounded-sm ${labelFont}`}
          >
            <ArrowLeft
              className={`h-4 w-4 ${isArabic ? "rotate-180" : ""}`}
            />
            {t("back_to_cards")}
          </button>
        </div>

        <AnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Customization Panel */}
            <div className="ornate-panel p-6 sm:p-8 relative overflow-hidden">
              <PanelCorners className="text-[var(--jewel-gold)] scale-75" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                  <EightPointStar
                    size={16}
                    className="text-[var(--jewel-gold)] mx-auto mb-3 opacity-80"
                  />
                  <h2
                    className={`text-2xl sm:text-3xl uppercase tracking-[0.18em] text-[var(--ivory)] ${labelFont}`}
                  >
                    {t("guide_name")}
                  </h2>
                  <StarDivider className="mt-3" width="max-w-xs" />
                </div>

                {/* Name Input */}
                <div className="mb-6">
                  <SectionLabel>{t("enter_name")}</SectionLabel>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-gold w-full px-4 py-2.5 rounded-sm placeholder:text-[var(--jewel-gold)]/50"
                    placeholder={t("enter_name")}
                    dir={fontLanguage === "arabic" ? "rtl" : "ltr"}
                  />
                </div>

                {/* Color Picker */}
                <div className="mb-6">
                  <SectionLabel>{t("guide_color")}</SectionLabel>
                  <div className="input-gold w-full h-12 rounded-sm overflow-hidden">
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => setColor(e.target.value)}
                      className="w-full h-full cursor-pointer border-0 bg-transparent"
                    />
                  </div>
                </div>

                {/* Font Language Toggle */}
                <div className="mb-6">
                  <SectionLabel>{t("font_language")}</SectionLabel>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setFontLanguage("arabic")}
                      className={`flex-1 px-4 py-2.5 rounded-sm uppercase tracking-[0.18em] text-sm transition-all duration-300 ${
                        fontLanguage === "arabic"
                          ? "bg-gradient-to-br from-[var(--jewel-gold)] to-[var(--jewel-gold-deep)] text-[var(--ink)] shadow-md"
                          : "border border-[var(--jewel-gold)]/50 text-[var(--jewel-gold)] hover:bg-[var(--jewel-gold)]/10"
                      } ${labelFont}`}
                    >
                      {isArabic ? "عربي" : "Arabic"}
                    </button>
                    <button
                      onClick={() => setFontLanguage("english")}
                      className={`flex-1 px-4 py-2.5 rounded-sm uppercase tracking-[0.18em] text-sm transition-all duration-300 ${
                        fontLanguage === "english"
                          ? "bg-gradient-to-br from-[var(--jewel-gold)] to-[var(--jewel-gold-deep)] text-[var(--ink)] shadow-md"
                          : "border border-[var(--jewel-gold)]/50 text-[var(--jewel-gold)] hover:bg-[var(--jewel-gold)]/10"
                      } ${labelFont}`}
                    >
                      {isArabic ? "إنجليزي" : "English"}
                    </button>
                  </div>
                </div>

                {/* Font Selector */}
                <div className="space-y-4 mb-6">
                  {fontLanguage === "arabic" ? (
                    <div>
                      <SectionLabel>{t("arabic_font")}</SectionLabel>
                      <select
                        value={arabicFont}
                        onChange={(e) => {
                          setArabicFont(e.target.value);
                          setFont(e.target.value);
                        }}
                        className="input-gold w-full px-4 py-2.5 rounded-sm"
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
                      <SectionLabel>{t("english_font")}</SectionLabel>
                      <select
                        value={englishFont}
                        onChange={(e) => {
                          setEnglishFont(e.target.value);
                          setFont(e.target.value);
                        }}
                        className="input-gold w-full px-4 py-2.5 rounded-sm"
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

                  {/* Font Size */}
                  <div>
                    <SectionLabel>
                      {t("guide_font_size")}{" "}
                      <span className="text-[var(--ivory)]/70 normal-case tracking-normal">
                        — {fontSize}px
                      </span>
                    </SectionLabel>
                    <input
                      type="range"
                      min="30"
                      max="120"
                      value={fontSize}
                      onChange={(e) => setFontSize(parseInt(e.target.value))}
                      className="range-gold"
                    />
                  </div>
                </div>

                {/* Divider */}
                <StarDivider className="my-6" width="max-w-xs" />

                {/* Presets */}
                <div className="mb-5">
                  <SectionLabel>{t("preview")}</SectionLabel>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.keys(presets).map((presetName) => (
                      <button
                        key={presetName}
                        onClick={() => applyPreset(presetName)}
                        className={`cta-gold px-3 py-2 text-xs uppercase tracking-[0.18em] rounded-sm ${labelFont}`}
                      >
                        {t(presetName)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Undo / Reset */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <button
                    onClick={undo}
                    disabled={history.length === 0}
                    className={`cta-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm uppercase tracking-[0.18em] rounded-sm disabled:opacity-40 disabled:cursor-not-allowed ${labelFont}`}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    {t("undo")}
                  </button>
                  <button
                    onClick={reset}
                    className={`cta-gold inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm uppercase tracking-[0.18em] rounded-sm ${labelFont}`}
                  >
                    <RotateCcw className="h-4 w-4" />
                    {t("reset")}
                  </button>
                </div>

                {/* Download / Share — primary filled */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={downloadCard}
                    disabled={actionLoading || !name.trim()}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase tracking-[0.18em] rounded-sm bg-gradient-to-br from-[var(--jewel-gold)] to-[var(--jewel-gold-deep)] text-[var(--ink)] shadow-md hover:shadow-[0_12px_30px_rgba(200,162,74,0.4)] hover:from-[var(--jewel-gold-bright)] hover:to-[var(--jewel-gold)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${labelFont}`}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    {t("download_card")}
                  </button>
                  <button
                    onClick={shareCard}
                    disabled={actionLoading || !name.trim()}
                    className={`inline-flex items-center justify-center gap-2 px-6 py-3 text-sm uppercase tracking-[0.18em] rounded-sm bg-gradient-to-br from-[var(--jewel-gold)] to-[var(--jewel-gold-deep)] text-[var(--ink)] shadow-md hover:shadow-[0_12px_30px_rgba(200,162,74,0.4)] hover:from-[var(--jewel-gold-bright)] hover:to-[var(--jewel-gold)] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed ${labelFont}`}
                  >
                    {actionLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Share2 className="h-4 w-4" />
                    )}
                    {t("share_card")}
                  </button>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="ornate-panel p-6 sm:p-8 relative overflow-hidden">
              <PanelCorners className="text-[var(--jewel-gold)] scale-75" />

              <div className="relative z-10">
                {/* Header */}
                <div className="text-center mb-6">
                  <EightPointStar
                    size={16}
                    className="text-[var(--jewel-gold)] mx-auto mb-3 opacity-80"
                  />
                  <h3
                    className={`text-xl sm:text-2xl uppercase tracking-[0.18em] text-[var(--ivory)] ${labelFont}`}
                  >
                    {t("card_preview")}
                  </h3>
                  <StarDivider className="mt-3" width="max-w-xs" />
                </div>

                {/* Canvas */}
                <div className="relative flex justify-center">
                  <div className="mihrab-frame inline-block max-w-md">
                    <canvas
                      ref={previewRef}
                      onClick={handlePreviewClick}
                      className="w-full block cursor-crosshair"
                      style={{
                        transform: `scale(${zoomLevel})`,
                        transformOrigin: "center top",
                      }}
                    />
                  </div>

                  {!name.trim() && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <p
                        className={`px-4 py-2 bg-[var(--ink)]/70 text-[var(--jewel-gold)] text-sm uppercase tracking-[0.2em] rounded-sm ${labelFont}`}
                      >
                        {t("position_tip")}
                      </p>
                    </div>
                  )}
                </div>

                {/* Zoom Controls */}
                <div className="flex justify-center items-center gap-3 mt-6">
                  <button
                    onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}
                    className="cta-gold p-2 rounded-sm"
                    aria-label={t("zoom_out")}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </button>
                  <span
                    className={`px-3 py-1.5 text-xs uppercase tracking-[0.18em] text-[var(--jewel-gold)] border border-[var(--jewel-gold)]/40 rounded-sm ${labelFont}`}
                  >
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}
                    className="cta-gold p-2 rounded-sm"
                    aria-label={t("zoom_in")}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 bg-[var(--jewel-plum)] text-[var(--ivory)] border border-[var(--jewel-gold)] px-5 py-3 rounded-sm shadow-2xl z-50">
            {error}
            <button
              onClick={() => setError(null)}
              className="ml-3 text-[var(--jewel-gold)] hover:text-[var(--jewel-gold-bright)]"
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
