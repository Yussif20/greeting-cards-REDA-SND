import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Common
      copyright: "© 2025 Reda Hazard Control. All rights reserved.",

      // Header
      home: "Home",
      about: "About",
      contact: "Contact",
      change_language: "Change Language",
      language_ar: "Arabic",
      language_en: "English",

      // Home
      greeting: "Happy Saudi National Day",
      wishes:
        "Celebrating the pride and heritage of the Kingdom of Saudi Arabia with family and friends",
      description:
        "At Reda Hazard Control, we celebrate Saudi National Day by creating personalized greeting cards to share the national pride",
      create_card: "Create Your Card Now",
      visit_website: "Visit Website",
      cards_downloaded: "{count} cards downloaded so far",
      download_count_error:
        "Failed to fetch download count. Please try again later.",

      // CardSelector
      select_card: "Select a Card",
      cards: "Cards",
      customize_card: "Customize Card",
      back_to_cards: "Back to Cards",

      // Saudi National Day Categories
      category_traditional: "Traditional",
      category_modern: "Modern",
      category_landmarks: "Landmarks",
      category_nature: "Natural Beauty",
      category_symbols: "Flags & Symbols",
      category_cultural: "Cultural Heritage",

      // Category descriptions
      traditional_desc: "Classic Saudi heritage and traditional patterns",
      modern_desc: "Contemporary designs and Vision 2030",
      landmarks_desc: "Iconic Saudi landmarks and architecture",
      nature_desc: "Arabian deserts, mountains, and natural beauty",
      symbols_desc: "Saudi flag, emblems, and national symbols",
      cultural_desc: "Traditional arts, crafts, and cultural elements",

      guide_name: "Customize Your Card",
      enter_name: "Enter your name",
      guide_color: "Text Color",
      font_language: "Font Language",
      arabic: "Arabic",
      english: "English",
      guide_font: "Font",
      arabic_font: "Arabic Font",
      english_font: "English Font",
      guide_font_style: "Font Style",
      normal: "Normal",
      bold: "Bold",
      italic: "Italic",
      guide_font_size: "Font Size",
      text_shadow: "Text Shadow",
      elegant: "Elegant",
      professional: "Professional",
      festive: "Festive",
      undo: "Undo",
      reset: "Reset",
      preview: "Preview",
      position_tip: "Click or drag to position text",
      card_preview: "Card Preview",
      text_preview: "Your Name",
      zoom_in: "Zoom In",
      zoom_out: "Zoom Out",
      save_card: "Save Card",
      share_card: "Share Card",
      greeting_card: "Greeting Card",
      share_message: "Check out my custom Saudi National Day card!",
      loading_fonts: "Loading fonts...",
      font_load_error_retry: "Failed to load fonts. Please try again.",
      image_load_error: "Failed to load image. Please select another card.",
      download_error: "Failed to download card. Please try again.",
      share_error: "Failed to share card. Please try again.",
      retry: "Retry",
      saudi_national_day_greeting: "Happy Saudi National Day!",
      saudi_national_day_message:
        "Celebrate the Kingdom's heritage and Vision 2030 with personalized greeting cards.",
      preview_description: "Preview of your custom Saudi National Day card.",
      cards_created: "Cards Created",
      happy_users: "Happy Users",
      support_available: "Support Available",
      saudi_national_testimonial_message:
        "Creating a custom Saudi National Day card filled me with pride for my country!",
      saudi_national_testimonial_author: "Ahmed S.",
    },
  },
  ar: {
    translation: {
      // Common
      copyright: "© 2025 Reda Hazard Control. جميع الحقوق محفوظة.",

      // Header
      home: "الرئيسية",
      about: "من نحن",
      contact: "اتصل بنا",
      change_language: "تغيير اللغة",
      language_ar: "العربية",
      language_en: "الإنجليزية",

      // Home
      greeting: "يوم وطني سعيد",
      wishes: "نحتفل بفخر وتراث المملكة العربية السعودية مع عائلتنا وأصدقائنا",
      description:
        "في رضا للسيطرة على المخاطر، نحتفل باليوم الوطني السعودي بإنشاء بطاقات تهنئة مخصصة لمشاركة الفخر الوطني",
      create_card: "أنشئ بطاقتك الآن",
      visit_website: "زيارة الموقع",
      cards_downloaded: "تم تنزيل {count} بطاقة حتى الآن",
      download_count_error:
        "فشل في جلب عدد التنزيلات. يرجى المحاولة مرة أخرى لاحقًا.",

      // CardSelector
      select_card: "اختر بطاقة",
      cards: "البطاقات",
      customize_card: "تخصيص البطاقة",
      back_to_cards: "العودة للبطاقات",

      // Saudi National Day Categories - Arabic
      category_traditional: "التراثية",
      category_modern: "العصرية",
      category_landmarks: "المعالم",
      category_nature: "الطبيعة الخلابة",
      category_symbols: "الأعلام والرموز",
      category_cultural: "التراث الثقافي",

      // Category descriptions - Arabic
      traditional_desc: "التراث السعودي الأصيل والأنماط التقليدية",
      modern_desc: "التصاميم المعاصرة ورؤية 2030",
      landmarks_desc: "المعالم السعودية الشهيرة والعمارة الفريدة",
      nature_desc: "الصحاري العربية والجبال والجمال الطبيعي",
      symbols_desc: "العلم السعودي والشعارات والرموز الوطنية",
      cultural_desc: "الفنون التقليدية والحرف والعناصر الثقافية",

      guide_name: "تخصيص بطاقتك",
      enter_name: "أدخل اسمك",
      guide_color: "لون النص",
      font_language: "لغة الخط",
      arabic: "العربية",
      english: "الإنجليزية",
      guide_font: "الخط",
      arabic_font: "الخط العربي",
      english_font: "الخط الإنجليزي",
      guide_font_style: "نمط الخط",
      normal: "عادي",
      bold: "غامق",
      italic: "مائل",
      guide_font_size: "حجم الخط",
      text_shadow: "ظل النص",
      elegant: "أنيق",
      professional: "احترافي",
      festive: "احتفالي",
      undo: "تراجع",
      reset: "إعادة تعيين",
      preview: "معاينة",
      position_tip: "انقر أو اسحب لتحديد موقع النص",
      card_preview: "معاينة البطاقة",
      text_preview: "اسمك",
      zoom_in: "تكبير",
      zoom_out: "تصغير",
      save_card: "حفظ البطاقة",
      share_card: "مشاركة البطاقة",
      greeting_card: "بطاقة تهنئة",
      share_message: "شاهد بطاقة اليوم الوطني السعودي المخصصة الخاصة بي!",
      loading_fonts: "جارٍ تحميل الخطوط...",
      font_load_error_retry: "فشل تحميل الخطوط. يرجى المحاولة مرة أخرى.",
      image_load_error: "فشل تحميل الصورة. يرجى اختيار بطاقة أخرى.",
      download_error: "فشل تنزيل البطاقة. يرجى المحاولة مرة أخرى.",
      share_error: "فشل مشاركة البطاقة. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
      saudi_national_day_greeting: "يوم وطني سعيد!",
      saudi_national_day_message:
        "احتفل بتراث المملكة ورؤية 2030 ببطاقات تهنئة مخصصة.",
      preview_description:
        "معاينة بطاقة اليوم الوطني السعودي المخصصة الخاصة بك.",
      cards_created: "بطاقات تم إنشاؤها",
      happy_users: "مستخدمون سعداء",
      support_available: "الدعم المتاح",
      saudi_national_testimonial_message:
        "إنشاء بطاقة يوم وطني مخصصة ملأني بالفخر لبلدي!",
      saudi_national_testimonial_author: "أحمد س.",
    },
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
