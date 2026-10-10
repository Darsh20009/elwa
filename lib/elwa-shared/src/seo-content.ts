export const SEO_BUSINESS = {
  siteUrl: "https://elwa.site",
  siteNameEn: "Elwa Coffee",
  siteNameAr: "إلوة كافيه",
  alternateNameEn: "Elwa Specialty Coffee",
  title: "Elwa Coffee in Bahrah | إلوة كافيه للقهوة المختصة",
  descriptionAr:
    "إلوة كافيه (Elwa Coffee) للقهوة المختصة في بحرة، السعودية. تصفح المنيو، اعرف عنوان الفرع وافتح الاتجاهات أو اطلب مباشرة عبر الإنترنت.",
  descriptionEn:
    "Elwa Coffee is a specialty coffee cafe in Bahrah, Saudi Arabia. Explore the menu, find the branch and place an online order.",
  branchAddressAr: "ج5921، بحره 22826",
  branchAddressEn: "J5921, Bahrah 22826",
  branchPhoneDisplay: "055 027 7975",
  branchPhoneE164: "+966550277975",
  mapUrl: "https://maps.app.goo.gl/zhHFfQVjWRxVKEBn6?g_st=ic",
  logoPath: "/logo-512.png",
  faviconPath: "/favicon.png",
} as const;

export const SEO_FAQS = [
  {
    questionAr: "أين يقع إلوة كافيه؟",
    answerAr: `يقع فرع إلوة كافيه في بحرة، السعودية، بعنوان ${SEO_BUSINESS.branchAddressAr}.`,
    questionEn: "Where is Elwa Coffee?",
    answerEn: `Elwa Coffee's branch is in Bahrah, Saudi Arabia, at ${SEO_BUSINESS.branchAddressEn}.`,
  },
  {
    questionAr: "ماذا يقدم إلوة كافيه في بحرة؟",
    answerAr:
      "يقدم إلوة كافيه القهوة المختصة ومجموعة من المشروبات والحلويات. تصفح المنتجات والأسعار في قائمة المنيو.",
    questionEn: "What does Elwa Coffee serve in Bahrah?",
    answerEn:
      "Elwa Coffee serves specialty coffee, drinks and desserts. Browse the menu for available items and prices.",
  },
  {
    questionAr: "كيف أطلب من إلوة كافيه؟",
    answerAr:
      "افتح المنيو، اختر المنتجات التي تريدها، ثم أكمل طلبك مباشرة عبر الموقع.",
    questionEn: "How can I order from Elwa Coffee?",
    answerEn:
      "Open the menu, choose your items and complete your order directly on the website.",
  },
] as const;
