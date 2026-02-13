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
      ramadan_title: "Ramadan",
      ramadan_occasion_description:
        "Create beautiful Ramadan greeting cards for your loved ones",
      founding_day_title: "Saudi Founding Day",
      founding_day_occasion_description:
        "Celebrate Saudi Arabia's founding with custom greeting cards",
      change_occasion: "Change Occasion",

      // Founding Day specific
      founding_day_greeting: "Happy Saudi Founding Day!",
      founding_day_message:
        "Celebrate the founding of Saudi Arabia with personalized greeting cards for your loved ones.",
      founding_day_preview_description:
        "Preview of your custom Founding Day greeting card.",
      founding_day_testimonial_message:
        "Creating a custom Founding Day card was a wonderful way to celebrate our nation's heritage!",
      founding_day_testimonial_author: "Fatima A.",

      // Header
      home: "Home",
      about: "About",
      contact: "Contact",
      change_language: "Change Language",
      language_ar: "Arabic",
      language_en: "English",

      // Home
      greeting: "Ramadan Mubarak",
      wishes: "Wishing you a blessed and peaceful Ramadan with your loved ones",
      description:
        "At Reda Hazard Control, we celebrate the holy month of Ramadan by creating personalized greeting cards to share blessings and joy",
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

      // Ramadan Categories
      category_traditional: "Traditional",
      category_modern: "Modern",
      category_landmarks: "Mosques",
      category_nature: "Lanterns & Lights",
      category_symbols: "Crescent & Stars",
      category_cultural: "Islamic Art",

      // Category descriptions
      traditional_desc:
        "Classic Ramadan greetings with traditional Islamic patterns",
      modern_desc: "Contemporary Ramadan designs with a modern touch",
      landmarks_desc: "Beautiful mosque illustrations and Islamic architecture",
      nature_desc: "Warm lantern glows and festive Ramadan lights",
      symbols_desc: "Crescent moon, stars, and Ramadan symbols",
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
      share_message: "Check out my custom Ramadan greeting card!",
      loading_fonts: "Loading fonts...",
      font_load_error_retry: "Failed to load fonts. Please try again.",
      image_load_error: "Failed to load image. Please select another card.",
      download_error: "Failed to download card. Please try again.",
      share_error: "Failed to share card. Please try again.",
      retry: "Retry",
      sample_card: "Sample Ramadan greeting card",
      enter_name_first: "Please enter your name first",
      download_card: "Download Card",
      ramadan_greeting: "Ramadan Mubarak!",
      ramadan_message:
        "Celebrate the holy month with personalized greeting cards for your loved ones.",
      preview_description: "Preview of your custom Ramadan greeting card.",
      cards_created: "Cards Created",
      happy_users: "Happy Users",
      support_available: "Support Available",
      ramadan_testimonial_message:
        "Creating a custom Ramadan card brought so much joy to my family and friends!",
      ramadan_testimonial_author: "Ahmed S.",
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
      ramadan_title: "رمضان",
      ramadan_occasion_description: "أنشئ بطاقات تهنئة رمضانية جميلة لأحبائك",
      founding_day_title: "يوم التأسيس السعودي",
      founding_day_occasion_description:
        "احتفل بتأسيس المملكة العربية السعودية ببطاقات تهنئة مخصصة",
      change_occasion: "تغيير المناسبة",

      // Founding Day specific
      founding_day_greeting: "يوم التأسيس السعودي !",
      founding_day_message:
        "احتفل بتأسيس المملكة العربية السعودية ببطاقات تهنئة مخصصة لأحبائك.",
      founding_day_preview_description:
        "معاينة بطاقة يوم التأسيس المخصصة الخاصة بك.",
      founding_day_testimonial_message:
        "إنشاء بطاقة يوم التأسيس المخصصة كانت طريقة رائعة للاحتفال بتراث وطننا!",
      founding_day_testimonial_author: "فاطمة أ.",

      // Header
      home: "الرئيسية",
      about: "من نحن",
      contact: "اتصل بنا",
      change_language: "تغيير اللغة",
      language_ar: "العربية",
      language_en: "الإنجليزية",

      // Home
      greeting: "رمضان مبارك",
      wishes: "نتمنى لكم شهر رمضان مبارك وسعيد مع أحبائكم",
      description:
        "في رضا للسيطرة على المخاطر، نحتفل بشهر رمضان المبارك بإنشاء بطاقات تهنئة مخصصة لمشاركة البركة والفرح",
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

      // Ramadan Categories - Arabic
      category_traditional: "التراثية",
      category_modern: "العصرية",
      category_landmarks: "المساجد",
      category_nature: "الفوانيس والأضواء",
      category_symbols: "الهلال والنجوم",
      category_cultural: "الفن الإسلامي",

      // Category descriptions - Arabic
      traditional_desc: "تهاني رمضان الكلاسيكية بأنماط إسلامية تقليدية",
      modern_desc: "تصاميم رمضانية معاصرة بلمسة عصرية",
      landmarks_desc: "رسومات المساجد الجميلة والعمارة الإسلامية",
      nature_desc: "توهج الفوانيس الدافئ وأضواء رمضان الاحتفالية",
      symbols_desc: "الهلال والنجوم ورموز رمضان",
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
      share_message: "شاهد بطاقة رمضان المخصصة الخاصة بي!",
      loading_fonts: "جارٍ تحميل الخطوط...",
      font_load_error_retry: "فشل تحميل الخطوط. يرجى المحاولة مرة أخرى.",
      image_load_error: "فشل تحميل الصورة. يرجى اختيار بطاقة أخرى.",
      download_error: "فشل تنزيل البطاقة. يرجى المحاولة مرة أخرى.",
      share_error: "فشل مشاركة البطاقة. يرجى المحاولة مرة أخرى.",
      retry: "إعادة المحاولة",
      sample_card: "نموذج بطاقة تهنئة رمضان",
      enter_name_first: "يرجى إدخال اسمك أولاً",
      download_card: "تحميل البطاقة",
      ramadan_greeting: "رمضان مبارك!",
      ramadan_message: "احتفل بالشهر الفضيل ببطاقات تهنئة مخصصة لأحبائك.",
      preview_description: "معاينة بطاقة رمضان المخصصة الخاصة بك.",
      cards_created: "بطاقات تم إنشاؤها",
      happy_users: "مستخدمون سعداء",
      support_available: "الدعم المتاح",
      ramadan_testimonial_message:
        "إنشاء بطاقة رمضان مخصصة أدخل الفرح على عائلتي وأصدقائي!",
      ramadan_testimonial_author: "أحمد س.",
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
