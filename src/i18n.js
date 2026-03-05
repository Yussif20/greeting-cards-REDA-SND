import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      // Common
      copyright: "© 2026 Reda Hazard Control. All rights reserved.",

      // Occasion Selector
      select_occasion: "Choose Your Occasion",
      select_occasion_description:
        "Select an occasion to create personalized greeting cards",
      select: "Select",

      // Eid Al Fitr
      eid_fitr_title: "Eid Al Fitr",
      eid_fitr_occasion_description:
        "Celebrate Eid Al Fitr with beautiful personalized greeting cards",
      eid_fitr_greeting: "Eid Mubarak!",
      eid_fitr_message:
        "Celebrate the joyous occasion of Eid Al Fitr with personalized greeting cards for your loved ones.",
      eid_fitr_preview_description:
        "Preview of your custom Eid Al Fitr greeting card.",
      eid_fitr_testimonial_message:
        "Creating a custom Eid card brought so much joy to my family and friends!",
      eid_fitr_testimonial_author: "Ahmed S.",

      // Ramadan (commented out — kept for future use)
      // ramadan_title: "Ramadan",
      // ramadan_occasion_description: "Create beautiful Ramadan greeting cards for your loved ones",
      // ramadan_greeting: "Ramadan Mubarak!",
      // ramadan_message: "Celebrate the holy month with personalized greeting cards for your loved ones.",
      // ramadan_testimonial_message: "Creating a custom Ramadan card brought so much joy to my family and friends!",
      // ramadan_testimonial_author: "Ahmed S.",

      // Founding Day (commented out — kept for future use)
      // founding_day_title: "Saudi Founding Day",
      // founding_day_occasion_description: "Celebrate Saudi Arabia's founding with custom greeting cards",
      // founding_day_greeting: "Happy Saudi Founding Day!",
      // founding_day_message: "Celebrate the founding of Saudi Arabia with personalized greeting cards for your loved ones.",
      // founding_day_preview_description: "Preview of your custom Founding Day greeting card.",
      // founding_day_testimonial_message: "Creating a custom Founding Day card was a wonderful way to celebrate our nation's heritage!",
      // founding_day_testimonial_author: "Fatima A.",

      change_occasion: "Change Occasion",

      // Header
      home: "Home",
      about: "About",
      contact: "Contact",
      change_language: "Change Language",
      language_ar: "Arabic",
      language_en: "English",

      // Home
      greeting: "Eid Mubarak",
      wishes: "Wishing you and your family a joyous and blessed Eid Al Fitr",
      description:
        "At Reda Hazard Control, we celebrate the joyous occasion of Eid Al Fitr by creating personalized greeting cards to share happiness and blessings",
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

      // Eid Categories
      category_traditional: "Traditional",
      category_modern: "Modern",
      category_landmarks: "Festive",
      category_nature: "Family & Joy",
      category_symbols: "Crescent & Stars",
      category_cultural: "Islamic Art",

      // Category descriptions
      traditional_desc:
        "Classic Eid greetings with traditional Islamic patterns",
      modern_desc: "Contemporary Eid designs with a modern touch",
      landmarks_desc: "Festive Eid celebrations and joyful gatherings",
      nature_desc: "Family warmth and the joy of Eid celebrations",
      symbols_desc: "Crescent moon, stars, and Eid symbols",
      cultural_desc:
        "Islamic calligraphy, arabesque patterns, and geometric art",

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
      share_message: "Check out my custom Eid Al Fitr greeting card!",
      loading_fonts: "Loading fonts...",
      font_load_error_retry: "Failed to load fonts. Please try again.",
      image_load_error: "Failed to load image. Please select another card.",
      download_error: "Failed to download card. Please try again.",
      share_error: "Failed to share card. Please try again.",
      retry: "Retry",
      sample_card: "Sample Eid Al Fitr greeting card",
      enter_name_first: "Please enter your name first",
      download_card: "Download Card",
      preview_description: "Preview of your custom Eid Al Fitr greeting card.",
      cards_created: "Cards Created",
      happy_users: "Happy Users",
      support_available: "Support Available",
    },
  },
  ar: {
    translation: {
      // Common
      copyright: "© 2026 Reda Hazard Control. جميع الحقوق محفوظة.",

      // Occasion Selector
      select_occasion: "اختر المناسبة",
      select_occasion_description: "اختر مناسبة لإنشاء بطاقات تهنئة مخصصة",
      select: "اختر",

      // Eid Al Fitr
      eid_fitr_title: "عيد الفطر",
      eid_fitr_occasion_description:
        "احتفل بعيد الفطر المبارك ببطاقات تهنئة مخصصة جميلة",
      eid_fitr_greeting: "عيد مبارك!",
      eid_fitr_message:
        "احتفل بمناسبة عيد الفطر السعيدة ببطاقات تهنئة مخصصة لأحبائك.",
      eid_fitr_preview_description: "معاينة بطاقة عيد الفطر المخصصة الخاصة بك.",
      eid_fitr_testimonial_message:
        "إنشاء بطاقة عيد مخصصة أدخل الفرح على عائلتي وأصدقائي!",
      eid_fitr_testimonial_author: "أحمد س.",

      // Ramadan (commented out — kept for future use)
      // ramadan_title: "رمضان",
      // ramadan_occasion_description: "أنشئ بطاقات تهنئة رمضانية جميلة لأحبائك",
      // ramadan_greeting: "رمضان مبارك!",
      // ramadan_message: "احتفل بالشهر الفضيل ببطاقات تهنئة مخصصة لأحبائك.",
      // ramadan_testimonial_message: "إنشاء بطاقة رمضان مخصصة أدخل الفرح على عائلتي وأصدقائي!",
      // ramadan_testimonial_author: "أحمد س.",

      // Founding Day (commented out — kept for future use)
      // founding_day_title: "يوم التأسيس السعودي",
      // founding_day_occasion_description: "احتفل بتأسيس المملكة العربية السعودية ببطاقات تهنئة مخصصة",
      // founding_day_greeting: "يوم التأسيس السعودي !",
      // founding_day_message: "احتفل بتأسيس المملكة العربية السعودية ببطاقات تهنئة مخصصة لأحبائك.",
      // founding_day_preview_description: "معاينة بطاقة يوم التأسيس المخصصة الخاصة بك.",
      // founding_day_testimonial_message: "إنشاء بطاقة يوم التأسيس المخصصة كانت طريقة رائعة للاحتفال بتراث وطننا!",
      // founding_day_testimonial_author: "فاطمة أ.",

      change_occasion: "تغيير المناسبة",

      // Header
      home: "الرئيسية",
      about: "من نحن",
      contact: "اتصل بنا",
      change_language: "تغيير اللغة",
      language_ar: "العربية",
      language_en: "الإنجليزية",

      // Home
      greeting: "عيد مبارك",
      wishes: "نتمنى لكم ولعائلتكم عيد فطر سعيد ومبارك",
      description:
        "في رضا للسيطرة على المخاطر، نحتفل بمناسبة عيد الفطر السعيدة بإنشاء بطاقات تهنئة مخصصة لمشاركة السعادة والبركة",
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

      // Eid Categories - Arabic
      category_traditional: "التراثية",
      category_modern: "العصرية",
      category_landmarks: "الاحتفالية",
      category_nature: "العائلة والفرح",
      category_symbols: "الهلال والنجوم",
      category_cultural: "الفن الإسلامي",

      // Category descriptions - Arabic
      traditional_desc: "تهاني العيد الكلاسيكية بأنماط إسلامية تقليدية",
      modern_desc: "تصاميم عيد معاصرة بلمسة عصرية",
      landmarks_desc: "احتفالات العيد المبهجة والتجمعات السعيدة",
      nature_desc: "دفء العائلة وفرحة احتفالات العيد",
      symbols_desc: "الهلال والنجوم ورموز العيد",
      cultural_desc: "الخط الإسلامي والزخارف العربية والفن الهندسي",

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
      share_message: "شاهد بطاقة عيد الفطر المخصصة الخاصة بي!",
      loading_fonts: "جارٍ تحميل الخطوط...",
      font_load_error_retry: "فشل تحميل الخطوط. يرجى المحاولة مرة أخرى.",
      image_load_error: "فشل تحميل الصورة. يرجى اختيار بطاقة أخرى.",
      download_error: "فشل تنزيل البطاقة. يرجى المحاولة مرة أخرى.",
      share_error: "فشل مشاركة البطاقة. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
      sample_card: "نموذج بطاقة تهنئة عيد الفطر",
      enter_name_first: "يرجى إدخال اسمك أولاً",
      download_card: "تحميل البطاقة",
      preview_description: "معاينة بطاقة عيد الفطر المخصصة الخاصة بك.",
      cards_created: "بطاقات تم إنشاؤها",
      happy_users: "مستخدمون سعداء",
      support_available: "الدعم المتاح",
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
