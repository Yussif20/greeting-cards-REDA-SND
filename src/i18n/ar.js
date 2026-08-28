// UI chrome only. Occasion and design copy lives in src/data/*.

export default {
  common: {
    appName: "بطاقات رضا",
    tagline: "معاً في كل مناسبة",
    taglineAr: "بطاقات معايدة رسمية لمختلف المناسبات على مدار العام",
    breadcrumb: { home: "الرئيسية" },
    language: "اللغة",
    theme: { light: "الوضع الفاتح", dark: "الوضع الداكن", label: "المظهر" },
    loading: "جارٍ التحميل",
    dismiss: "إغلاق",
  },

  home: {
    title: "بطاقات رضا",
    subtitle: "معاً في كل مناسبة",
    intro: "بطاقات معايدة رسمية لمختلف المناسبات على مدار العام.",
    openOccasion: "فتح {{name}}",
  },

  designs: {
    heading: "اختر التصميم",
    chooseADesign: "اختر التصميم",
    year: "السنة",
    loadMore: "عرض المزيد من التصاميم",
    selected: "محدد",
    design: "تصميم",
    empty: "لا توجد تصاميم مطابقة لهذا التصنيف.",
    clearFilter: "عرض كل التصاميم",
    sampleArtwork: "عينة تصميم",
    sampleNotice:
      "تصاميم هذه المناسبة قيد الإعداد. البطاقات المعروضة عينات مستعارة وتحمل تهنئة مناسبة أخرى.",
    style: {
      all: "الكل",
      modern: "عصري",
      traditional: "تقليدي",
      minimal: "بسيط",
      elegant: "أنيق",
    },
  },

  editor: {
    title: "تخصيص بطاقتك",
    subtitle: "خصص بطاقتك لتناسبك",
    optional: "اختياري",
    preview: "معاينة البطاقة",
    field: {
      name: "الاسم",
      jobTitle: "المسمى الوظيفي",
      brand: "الشركة",
      font: "الخط",
      textColor: "لون النص",
    },
    placeholder: {
      name: "أدخل اسمك",
      jobTitle: "أدخل مسماك الوظيفي",
    },
    fontHelp:
      "يُطبَّق الخط على الاسم والمسمى الوظيفي معاً. وكل الخيارات تدعم العربية واللاتينية.",
    brandUnavailable: "لا توجد بطاقة لهذه الشركة في هذه المناسبة",
    tool: {
      move: "تحريك",
      size: "الحجم",
      align: "المحاذاة",
    },
    align: {
      left: "يسار",
      center: "توسيط",
      right: "يمين",
      top: "أعلى",
      middle: "منتصف",
      bottom: "أسفل",
      distribute: "توزيع متساوٍ",
    },
    size: { label: "الحجم", nudge: "استخدم مفاتيح الأسهم لتحريك الطبقة المحددة" },
    action: {
      reset: "إعادة تعيين",
      saveDraft: "حفظ المسودة",
      download: "تحميل",
      share: "مشاركة",
    },
    draftSaved: "تم حفظ المسودة",
    draftRestored: "تمت استعادة المسودة",
    discardDraft: "تجاهل",
    resetDone: "تمت إعادة تعيين البطاقة",
    enterNameFirst: "أدخل الاسم أولاً",
    selectLayerHint: "انقر على البطاقة لتحديد النص وتحريكه",
  },

  errors: {
    notFoundTitle: "الصفحة غير موجودة",
    notFoundBody: "هذه الصفحة غير موجودة. سنعيدك إلى البداية.",
    backHome: "العودة إلى المناسبات",
    imageLoad: "تعذر تحميل هذا التصميم. الرجاء اختيار تصميم آخر.",
    download: "تعذر تحميل البطاقة. الرجاء المحاولة مرة أخرى.",
    share: "تعذرت مشاركة البطاقة. الرجاء المحاولة مرة أخرى.",
    unknownOccasion: "تعذر العثور على هذه المناسبة.",
  },

  footer: {
    tagline: "معاً في كل مناسبة",
  },

  admin: {
    title: "لوحة تحكم بطاقات ريدة",
    loading: "جارٍ التحميل…",
    retry: "إعادة المحاولة",

    auth: {
      subtitle: "سجّل الدخول لإدارة المناسبات والبطاقات.",
      email: "البريد الإلكتروني",
      password: "كلمة المرور",
      signIn: "تسجيل الدخول",
      signOut: "تسجيل الخروج",
      invalid: "البريد الإلكتروني أو كلمة المرور غير صحيحة. الرجاء المحاولة مرة أخرى.",
      notAdminTitle: "هذا الحساب ليس حساب مسؤول",
      notAdminBody:
        "تم تسجيل دخولك، لكن هذا الحساب لا يملك صلاحية الإدارة. اطلب من المسؤول عن الموقع إضافتك.",
      unconfiguredTitle: "لوحة التحكم غير مهيأة",
      unconfiguredBody:
        "المتغيران VITE_SUPABASE_URL والمفتاح العام غير موجودين في هذه النسخة. راجع ملف .env.example.",
    },

    nav: {
      label: "أقسام لوحة التحكم",
      occasions: "المناسبات",
      designs: "البطاقات",
      viewSite: "عرض الموقع",
    },

    status: {
      published: "منشورة",
      draft: "مسودة",
      archived: "مؤرشفة",
    },

    occasions: {
      title: "المناسبات",
      subtitle: "كل ما يمكن للموقع عرضه، بما في ذلك ما لم يُنشر بعد.",
      empty: "لا توجد مناسبات بعد.",
      hidden: "مخفية عن الصفحة الرئيسية",
      designCount: "{{count}} بطاقة",
      draftCount: "{{count}} غير منشورة",
    },

    designs: {
      title: "البطاقات",
      subtitle: "التصاميم لكل مناسبة وكل موسم.",
      occasion: "المناسبة",
      allOccasions: "كل المناسبات",
      empty: "لا توجد بطاقات لهذه المناسبة بعد.",
      placeholder: "تصميم مؤقت",
    },

    errors: {
      loadFailed: "تعذر تحميل البيانات من قاعدة البيانات.",
    },
  },
};
