import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { useTranslation } from "react-i18next";
import { imageCategories } from "../data";
import debounce from "lodash/debounce";
import {
  Download,
  Palette,
  Type,
  ChevronsUpDown,
  Wand2,
  Check,
  Loader2,
  ArrowLeft, // Replaced Undo2 with ArrowLeft to avoid SVG path issues
  RotateCcw, // Replaced RefreshCw with RotateCcw for consistency
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import AnimatedSection from "./AnimatedSection";

const CardSelector = () => {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedCardType, setSelectedCardType] = useState(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#ffffff");
  const [namePosition, setNamePosition] = useState({ x: 540, y: 540 });
  const [font, setFont] = useState("Cairo");
  const [fontStyle, setFontStyle] = useState("normal");
  const [fontLanguage, setFontLanguage] = useState("arabic");
  const [fontSize, setFontSize] = useState(60);
  const [textShadow, setTextShadow] = useState(2);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  const previewRef = useRef(null);
  const namePreviewRef = useRef(null);
  const containerRef = useRef(null);

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
        color: "#000000",
        font: "Cairo",
        fontStyle: "normal",
        fontSize: 70,
        textShadow: 2,
      },
      festive: {
        color: "#B91C1C",
        font: "Scheherazade",
        fontStyle: "normal",
        fontSize: 90,
        textShadow: 4,
      },
    }),
    []
  );

  // Font configuration
  const fontConfig = useMemo(
    () => ({
      arabic: [
        "Cairo",
        "Tajawal",
        "Amiri",
        "Noto Naskh Arabic",
        "Scheherazade",
        "Almarai",
        "Reem Kufi",
      ],
      english: [
        "Roboto",
        "Merriweather",
        "Playfair Display",
        "Open Sans",
        "Montserrat",
      ],
    }),
    []
  );

  // Font loading with improved Arabic support
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

        const preconnect = document.createElement("link");
        preconnect.rel = "preconnect";
        preconnect.href = "https://fonts.googleapis.com";
        document.head.appendChild(preconnect);

        const defaultFonts = ["Cairo", "Roboto", "Amiri", "Scheherazade"];
        defaultFonts.forEach((fontName) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
            /\s+/g,
            "+"
          )}:wght@400;700&display=swap`;
          document.head.appendChild(link);
        });

        await Promise.race([
          document.fonts.ready,
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Font load timeout")), 5000)
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

  // Load additional fonts on demand
  const loadFontOnDemand = useCallback(
    async (fontName) => {
      if (document.fonts.check(`16px "${fontName}"`)) return;
      try {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
          /\s+/g,
          "+"
        )}:wght@400;700&display=swap`;
        document.head.appendChild(link);
        await document.fonts.ready;
      } catch (err) {
        console.error(`Failed to load font ${fontName}:`, err);
        setError(t("font_load_error_retry"));
        setFont(fontLanguage === "arabic" ? "Cairo" : "Roboto");
      }
    },
    [t, fontLanguage]
  );

  // Retry font loading
  const retryFontLoading = useCallback(() => {
    setError(null);
    localStorage.removeItem("loadedFonts");
    setFontsLoaded(false);
    setIsLoading(true);
    const loadFonts = async () => {
      try {
        const defaultFonts = ["Cairo", "Roboto", "Amiri", "Scheherazade"];
        defaultFonts.forEach((fontName) => {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(
            /\s+/g,
            "+"
          )}:wght@400;700&display=swap`;
          document.head.appendChild(link);
        });
        await document.fonts.ready;
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

  // Save state to history
  const saveToHistory = useCallback(() => {
    setHistory((prev) => [
      ...prev.slice(-9),
      {
        name,
        color,
        namePosition,
        font,
        fontStyle,
        fontSize,
        textShadow,
        fontLanguage,
      },
    ]);
  }, [
    name,
    color,
    namePosition,
    font,
    fontStyle,
    fontSize,
    textShadow,
    fontLanguage,
  ]);

  // Undo function
  const undo = useCallback(() => {
    if (history.length === 0) return;
    const previousState = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));
    setName(previousState.name);
    setColor(previousState.color);
    setNamePosition(previousState.namePosition);
    setFont(previousState.font);
    setFontStyle(previousState.fontStyle);
    setFontSize(previousState.fontSize);
    setTextShadow(previousState.textShadow);
    setFontLanguage(previousState.fontLanguage);
    loadFontOnDemand(previousState.font);
  }, [history, loadFontOnDemand]);

  // Reset function
  const reset = useCallback(() => {
    saveToHistory();
    setName("");
    setColor("#ffffff");
    setNamePosition({
      x: selectedImage?.width / 2 || 540,
      y: selectedImage?.height / 2 || 540,
    });
    setFont("Cairo");
    setFontStyle("normal");
    setFontSize(60);
    setTextShadow(2);
    setFontLanguage("arabic");
    loadFontOnDemand("Cairo");
  }, [saveToHistory, selectedImage, loadFontOnDemand]);

  // Select a card
  const selectCard = useCallback(
    (card) => {
      setIsLoading(true);
      setError(null);
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = card.src;

      img.onload = () => {
        setSelectedImage(img);
        setSelectedCardType(card.type);
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
        setSelectedCardType(null);
        setIsLoading(false);
      };
    },
    [t]
  );

  // Apply preset
  const applyPreset = useCallback(
    (presetName) => {
      const preset = presets[presetName];
      saveToHistory();
      setColor(preset.color);
      setFont(preset.font);
      setFontStyle(preset.fontStyle);
      setFontSize(preset.fontSize);
      setTextShadow(preset.textShadow);
      loadFontOnDemand(preset.font);
    },
    [presets, saveToHistory, loadFontOnDemand]
  );

  // Update preview
  const updatePreview = useCallback(() => {
    const preview = previewRef.current;
    const namePreview = namePreviewRef.current;
    if (!preview || !namePreview || !selectedImage) return;

    preview.style.backgroundImage = `url(${selectedImage.src})`;
    preview.style.backgroundSize = "contain";
    preview.style.backgroundPosition = "center";
    preview.style.backgroundRepeat = "no-repeat";
    preview.style.transform = `scale(${zoomLevel})`;

    namePreview.style.fontFamily = fontsLoaded
      ? `"${font}", system-ui, sans-serif`
      : "system-ui, sans-serif";
    namePreview.style.color = color;
    namePreview.style.fontSize = `${
      fontSize * (preview.offsetWidth / selectedImage.width)
    }px`;
    namePreview.style.fontWeight = fontStyle === "bold" ? "700" : "400";
    namePreview.style.fontStyle = fontStyle === "italic" ? "italic" : "normal";
    namePreview.style.textShadow = `0 1px ${textShadow}px rgba(0,0,0,0.5)`;
    namePreview.style.direction = fontLanguage === "arabic" ? "rtl" : "ltr";
    namePreview.style.textAlign = "center";

    const scaleX = preview.offsetWidth / selectedImage.width;
    const scaleY = preview.offsetHeight / selectedImage.height;

    namePreview.style.position = "absolute";
    namePreview.style.left = `${namePosition.x * scaleX}px`;
    namePreview.style.top = `${namePosition.y * scaleY}px`;
    namePreview.style.transform = "translate(-50%, -50%)";
    namePreview.innerText = name || t("text_preview");
  }, [
    selectedImage,
    name,
    color,
    namePosition,
    font,
    fontStyle,
    fontSize,
    textShadow,
    zoomLevel,
    t,
    fontsLoaded,
    fontLanguage,
  ]);

  const debouncedUpdatePreview = useMemo(
    () => debounce(updatePreview, 50),
    [updatePreview]
  );

  // Handle preview interactions
  const handlePreviewClick = useCallback(
    (e) => {
      if (!selectedImage || isDragging) return;
      saveToHistory();
      const preview = previewRef.current;
      const rect = preview.getBoundingClientRect();
      const scaleX = selectedImage.width / preview.offsetWidth;
      const scaleY = selectedImage.height / preview.offsetHeight;
      const x = (e.clientX - rect.left) * scaleX;
      const y = (e.clientY - rect.top) * scaleY;
      setNamePosition({ x, y });
      debouncedUpdatePreview();
    },
    [selectedImage, isDragging, saveToHistory, debouncedUpdatePreview]
  );

  const handleMouseDown = useCallback(
    (e) => {
      if (!selectedImage) return;
      e.preventDefault();
      saveToHistory();
      setIsDragging(true);
      const nameEl = namePreviewRef.current;
      const rect = nameEl.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left - rect.width / 2,
        y: e.clientY - rect.top - rect.height / 2,
      });
    },
    [selectedImage, saveToHistory]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging || !selectedImage) return;
      e.preventDefault();
      const preview = previewRef.current;
      const rect = preview.getBoundingClientRect();
      const scaleX = selectedImage.width / preview.offsetWidth;
      const scaleY = selectedImage.height / preview.offsetHeight;
      const x = (e.clientX - rect.left - dragOffset.x) * scaleX;
      const y = (e.clientY - rect.top - dragOffset.y) * scaleY;
      setNamePosition({ x, y });
      debouncedUpdatePreview();
    },
    [isDragging, selectedImage, dragOffset, debouncedUpdatePreview]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleTouchStart = useCallback(
    (e) => {
      if (!selectedImage) return;
      saveToHistory();
      const touch = e.touches[0];
      setIsDragging(true);
      const nameEl = namePreviewRef.current;
      const rect = nameEl.getBoundingClientRect();
      setDragOffset({
        x: touch.clientX - rect.left - rect.width / 2,
        y: touch.clientY - rect.top - rect.height / 2,
      });
    },
    [selectedImage, saveToHistory]
  );

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging || !selectedImage) return;
      const touch = e.touches[0];
      const preview = previewRef.current;
      const rect = preview.getBoundingClientRect();
      const scaleX = selectedImage.width / preview.offsetWidth;
      const scaleY = selectedImage.height / preview.offsetHeight;
      const x = (touch.clientX - rect.left - dragOffset.x) * scaleX;
      const y = (touch.clientY - rect.top - dragOffset.y) * scaleY;
      setNamePosition({ x, y });
      debouncedUpdatePreview();
    },
    [isDragging, selectedImage, dragOffset, debouncedUpdatePreview]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Download card
  const downloadCard = useCallback(async () => {
    if (!selectedImage) return;
    setActionLoading(true);
    setError(null);
    try {
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = selectedImage.width;
      tempCanvas.height = selectedImage.height;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(
        selectedImage,
        0,
        0,
        selectedImage.width,
        selectedImage.height
      );
      if (name) {
        tempCtx.font = `${fontStyle === "bold" ? "700" : "400"} ${
          fontStyle === "italic" ? "italic" : ""
        } ${fontSize}px "${font}"`;
        tempCtx.fillStyle = color;
        tempCtx.textAlign = "center";
        tempCtx.textBaseline = "middle";
        tempCtx.shadowColor = "rgba(0,0,0,0.5)";
        tempCtx.shadowBlur = textShadow;
        tempCtx.direction = fontLanguage === "arabic" ? "rtl" : "ltr";
        tempCtx.fillText(name, namePosition.x, namePosition.y);
      }
      const dataUrl = tempCanvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = "new-hijri-year-card.png";
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Download failed:", err);
      setError(t("download_error"));
    } finally {
      setActionLoading(false);
    }
  }, [
    selectedImage,
    name,
    fontStyle,
    fontSize,
    font,
    color,
    textShadow,
    namePosition,
    t,
    fontLanguage,
  ]);

  // Update preview on state changes
  useEffect(() => {
    if (!selectedImage || !fontsLoaded) return;
    debouncedUpdatePreview();
    const handleResize = () => debouncedUpdatePreview();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      debouncedUpdatePreview.cancel();
    };
  }, [selectedImage, fontsLoaded, debouncedUpdatePreview]);

  // Load font when changed
  useEffect(() => {
    if (fontsLoaded) {
      loadFontOnDemand(font);
    }
  }, [font, fontsLoaded, loadFontOnDemand]);

  // Flatten all cards into a single array with fallback
  const allCards = useMemo(() => {
    try {
      return Object.values(imageCategories).flat();
    } catch (err) {
      console.error("Error processing imageCategories:", err);
      return [];
    }
  }, []);

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900 flex flex-col font-sans bg-[url('/light-moon-small.png')] dark:bg-[url('/dark-moon-small.png')] bg-cover bg-no-repeat bg-center transition-all duration-300 sm:bg-[url('/light-moon.png')] sm:dark:bg-[url('/dark-moon.png')] sm:bg-fixed"
      dir={i18n.language === "ar" ? "rtl" : "ltr"}
      ref={containerRef}
    >
      <main className="flex-1 container mx-auto px-4 py-8 lg:px-8 lg:py-12 flex flex-col gap-8 animate-fade-in">
        {error && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg flex items-center max-w-3xl mx-auto">
            <span className="text-sm">{error}</span>
            {error.includes("font_load_error_retry") && (
              <button
                onClick={retryFontLoading}
                className="ml-4 px-3 py-1 bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-100 rounded hover:bg-red-300 dark:hover:bg-red-700 text-sm"
              >
                {t("retry")}
              </button>
            )}
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-700 dark:text-red-200 hover:text-red-900 dark:hover:text-red-100"
            >
              ✕
            </button>
          </div>
        )}

        {/* Card Selection Section */}
        <AnimatedSection>
          <section className="w-full max-w-7xl mx-auto mb-8 px-4 sm:px-6 lg:px-8 animate-fade-in delay-100">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground mb-6 flex items-center">
              <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white mr-3 sm:mr-4 text-sm sm:text-base">
                1
              </span>
              {t("select_card")}
            </h2>
            <div className="bg-gradient-card rounded-xl shadow-card p-4 sm:p-6 w-full box-border">
              {allCards.length > 0 ? (
                <CardSection
                  title={t("cards")}
                  cards={allCards}
                  selectedImage={selectedImage}
                  selectCard={selectCard}
                  type="card"
                  id="card-section-cards"
                />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t("no_cards_available")}
                </p>
              )}
            </div>
          </section>
        </AnimatedSection>
        {/* Divider */}
        <div className="max-w-6xl mx-auto border-b border-gray-300 dark:border-gray-600 bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-600 to-transparent h-px mb-12" />

        {/* Customization and Preview Section */}
        <AnimatedSection>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto animate-fade-in delay-200">
            {/* Customization Panel */}
            <div className="flex flex-col">
              <div className="bg-gradient-card rounded-xl shadow-card p-6">
                <h2 className="flex items-center text-2xl font-semibold text-foreground mb-6">
                  <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white mr-3">
                    2
                  </span>
                  {t("guide_name")}
                </h2>
                <div className="space-y-8">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      saveToHistory();
                      setName(e.target.value);
                    }}
                    placeholder={t("enter_name")}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all text-sm text-foreground"
                    aria-label={t("enter_name")}
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <div>
                      <label className="flex items-center text-sm font-medium text-foreground mb-2">
                        <Palette size={16} className="mr-2" />
                        {t("guide_color")}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => {
                            saveToHistory();
                            setColor(e.target.value);
                          }}
                          className="w-12 h-12 rounded-lg border-none cursor-pointer shadow-sm"
                          aria-label={t("guide_color")}
                        />
                        <span className="ml-3 text-sm font-mono text-gray-600 dark:text-gray-400">
                          {color}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-foreground mb-2">
                        {t("font_language")}
                      </label>
                      <div className="flex items-center space-x-6">
                        <RadioButton
                          label={t("arabic")}
                          checked={fontLanguage === "arabic"}
                          onChange={() => {
                            saveToHistory();
                            setFontLanguage("arabic");
                            setFont("Cairo");
                            loadFontOnDemand("Cairo");
                          }}
                        />
                        <RadioButton
                          label={t("english")}
                          checked={fontLanguage === "english"}
                          onChange={() => {
                            saveToHistory();
                            setFontLanguage("english");
                            setFont("Roboto");
                            loadFontOnDemand("Roboto");
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-foreground mb-2">
                        <Type size={16} className="mr-2" />
                        {t("guide_font")}
                      </label>
                      <Select
                        value={font}
                        onChange={(e) => {
                          saveToHistory();
                          setFont(e.target.value);
                          loadFontOnDemand(e.target.value);
                        }}
                        options={
                          fontLanguage === "arabic"
                            ? fontConfig.arabic.map((f) => ({
                                value: f,
                                label: f,
                              }))
                            : fontConfig.english.map((f) => ({
                                value: f,
                                label: f,
                              }))
                        }
                        aria-label={t("guide_font")}
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-foreground mb-2">
                        {t("guide_font_style")}
                      </label>
                      <Select
                        value={fontStyle}
                        onChange={(e) => {
                          saveToHistory();
                          setFontStyle(e.target.value);
                        }}
                        options={[
                          { value: "normal", label: t("normal") },
                          { value: "bold", label: t("bold") },
                          { value: "italic", label: t("italic") },
                        ]}
                        aria-label={t("guide_font_style")}
                      />
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-foreground mb-2">
                        {t("guide_font_size")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="20"
                          max="300"
                          step="5"
                          value={fontSize}
                          onChange={(e) => {
                            saveToHistory();
                            setFontSize(Number(e.target.value));
                          }}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer accent-blue-600"
                          aria-label={t("guide_font_size")}
                        />
                        <span className="text-sm font-mono w-14 text-right text-gray-600 dark:text-gray-400">
                          {fontSize}px
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="flex items-center text-sm font-medium text-foreground mb-2">
                        {t("text_shadow")}
                      </label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min="0"
                          max="10"
                          step="0.5"
                          value={textShadow}
                          onChange={(e) => {
                            saveToHistory();
                            setTextShadow(Number(e.target.value));
                          }}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg cursor-pointer accent-blue-600"
                          aria-label={t("text_shadow")}
                        />
                        <span className="text-sm font-mono w-14 text-right text-gray-600 dark:text-gray-400">
                          {textShadow}px
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-4">
                    {Object.keys(presets).map((preset) => (
                      <button
                        key={preset}
                        onClick={() => applyPreset(preset)}
                        className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all text-sm"
                      >
                        {t(preset)}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-4">
                    <button
                      onClick={undo}
                      disabled={history.length === 0}
                      className={
                        history.length === 0
                          ? "flex items-center px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed text-sm"
                          : "flex items-center px-4 py-2 rounded-lg bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-all text-sm"
                      }
                      aria-label={t("undo")}
                    >
                      <ArrowLeft size={16} className="mr-2" />
                      {t("undo")}
                    </button>
                    <button
                      onClick={reset}
                      className="flex items-center px-4 py-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-all text-sm"
                      aria-label={t("reset")}
                    >
                      <RotateCcw size={16} className="mr-2" />
                      {t("reset")}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview and Actions */}
            <div className="flex flex-col">
              <div className="bg-gradient-card rounded-xl shadow-card p-4 sm:p-6 px-0 sm:px-4 flex-1">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h2 className="flex items-center text-xl sm:text-2xl font-semibold text-foreground">
                    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-600 text-white mr-2 sm:mr-3 text-sm sm:text-base">
                      3
                    </span>
                    {t("preview")}
                  </h2>
                  <div className="flex items-center text-xs sm:text-sm text-blue-600 dark:text-blue-400">
                    <Wand2 size={16} className="mr-1 sm:mr-2" />
                    {t("position_tip")}
                  </div>
                </div>
                <div
                  className="relative w-full flex items-center justify-center"
                  aria-busy={isLoading}
                >
                  {isLoading ? (
                    <div className="w-full max-h-[480px] rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <div className="flex flex-col items-center">
                        <Loader2 className="w-8 sm:w-10 h-8 sm:h-10 text-blue-600 animate-spin mb-2" />
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          {t("loading_fonts")}
                        </p>
                      </div>
                    </div>
                  ) : selectedImage ? (
                    <div
                      id="preview-container"
                      className="w-full flex items-center justify-center"
                    >
                      <div
                        id="card-preview"
                        ref={previewRef}
                        className="relative rounded-xl shadow-xl bg-center bg-no-repeat bg-contain overflow-hidden cursor-pointer transition-transform duration-200 h-auto aspect-[16/9] w-full max-h-[540px] sm:max-h-[720px] lg:max-h-[810px]"
                        onClick={handlePreviewClick}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                        role="region"
                        aria-label={t("card_preview")}
                      >
                        <span
                          id="name-preview"
                          ref={namePreviewRef}
                          className="absolute cursor-move select-none text-base sm:text-lg lg:text-xl text-white drop-shadow-md"
                        >
                          {name || t("text_preview")}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full max-h-[480px] rounded-xl flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                        {t("select_card")}
                      </p>
                    </div>
                  )}
                </div>
                {selectedImage && (
                  <div className="flex items-center justify-center mt-4 gap-2">
                    <button
                      onClick={() =>
                        setZoomLevel((prev) => Math.min(prev + 0.1, 2))
                      }
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
                      aria-label={t("zoom_in")}
                    >
                      <ZoomIn size={16} />
                    </button>
                    <button
                      onClick={() =>
                        setZoomLevel((prev) => Math.max(prev - 0.1, 0.5))
                      }
                      className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-all"
                      aria-label={t("zoom_out")}
                    >
                      <ZoomOut size={16} />
                    </button>
                  </div>
                )}
                <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-4 sm:mt-8">
                  <button
                    onClick={downloadCard}
                    disabled={!selectedImage || actionLoading}
                    className={
                      !selectedImage || actionLoading
                        ? "flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-white bg-gray-300 dark:bg-gray-600 cursor-not-allowed text-xs sm:text-sm"
                        : "flex items-center justify-center px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-xs sm:text-sm"
                    }
                    aria-label={t("save_card")}
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 sm:w-5 h-4 sm:h-5 animate-spin mr-2" />
                    ) : (
                      <Download className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    )}
                    {t("save_card")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </main>
    </div>
  );
};

// Reusable Components
const CardSection = ({ title, cards, selectedImage, selectCard, type, id }) => (
  <div className="w-full" id={id}>
    <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
      {title}
    </h3>
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 justify-items-center mx-auto">
      {cards.map((card, index) => (
        <div
          key={`${type}-${index}`}
          className={`
            relative rounded-lg overflow-hidden shadow-md transition-transform duration-300 hover:scale-105 hover:shadow-lg p-3 sm:p-4 bg-white dark:bg-gray-800 w-full
            ${
              selectedImage?.src === card.src
                ? "border-2 border-blue-600 ring-2 ring-blue-200/50"
                : "border-2 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            }
            h-48 sm:h-64 aspect-[16/9]
          `}
          onClick={() => selectCard(card)}
          onKeyDown={(e) => e.key === "Enter" && selectCard(card)}
          role="button"
          tabIndex={0}
          aria-label={`${title} ${index}`}
        >
          <img
            src={card.src}
            alt={`${title} ${index}`}
            className="w-full h-full object-contain"
            loading="lazy"
          />
          {selectedImage?.src === card.src && (
            <div className="absolute inset-0 flex items-center justify-center bg-blue-600/20">
              <Check className="w-6 h-6 text-white" />
            </div>
          )}
        </div>
      ))}
    </div>
  </div>
);

const RadioButton = ({ label, checked, onChange }) => (
  <label className="inline-flex items-center cursor-pointer">
    <input
      type="radio"
      checked={checked}
      onChange={onChange}
      className="sr-only"
    />
    <div
      className={
        checked
          ? "w-5 h-5 rounded-full bg-blue-600 border flex items-center justify-center border-blue-600"
          : "w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-700 border flex items-center justify-center border-gray-300 dark:border-gray-600"
      }
    >
      {checked && <Check size={12} className="text-white" />}
    </div>
    <span className="ml-2 text-sm text-foreground">{label}</span>
  </label>
);

const Select = ({ value, onChange, options, ariaLabel }) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className="block w-full appearance-none bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-600 text-sm text-foreground"
      aria-label={ariaLabel}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
      <ChevronsUpDown size={16} className="text-gray-500" />
    </div>
  </div>
);

export default CardSelector;
