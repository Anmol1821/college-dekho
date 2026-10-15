"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Language = "en" | "hi";

// The Dictionary: All your text goes here
const translations = {
  en: {
    applyNow: "Apply Now",
    downloadBrochure: "Download Brochure",
    courses: "Courses Offered",
    similar: "Similar Institutes",
    fees: "Total Fees",
    seats: "Seats",
    eligibility: "Eligibility",
    riskScore: "Risk Score",
    placement: "Placement",
    padosiTitle: "The \"Padosi\" Check",
    padosiSub: "See if anyone from your hometown is studying here.",
    checkCity: "Enter City",
    fullTime: "Full Time",
    about: "About the Institute",
    highlights: "Quick Highlights",
    ownership: "Ownership",
    established: "Established",
    status: "Status",
    enquire: "Enquire Now",
    requestCallback: "Request Callback",
    checkEligibility: "Check Eligibility",
    successMsg: "Request Sent!",
    successSub: "Our counselor will call you within 24 hours.",
    search: "Search",
    colleges: "Colleges",
    exams: "Exams",
    scholarships: "Scholarships",
    testSeries: "Test Series",
    contact: "Contact Us",
  },
  hi: {
    applyNow: "अभी आवेदन करें",
    downloadBrochure: "ब्रोशर डाउनलोड करें",
    courses: "उपलब्ध कोर्स",
    similar: "समान संस्थान",
    fees: "कुल फीस",
    seats: "सीटें",
    eligibility: "योग्यता",
    riskScore: "जोखिम स्कोर",
    placement: "प्लेसमेंट",
    padosiTitle: "\"पड़ोसी\" चेक",
    padosiSub: "देखें कि आपके शहर का कोई छात्र यहाँ पढ़ रहा है या नहीं।",
    checkCity: "शहर का नाम लिखें",
    fullTime: "फुल टाइम",
    about: "संस्थान के बारे में",
    highlights: "मुख्य जानकारी",
    ownership: "स्वामित्व",
    established: "स्थापना वर्ष",
    status: "स्थिति",
    enquire: "पूछताछ करें",
    requestCallback: "कॉल बैक का अनुरोध करें",
    checkEligibility: "योग्यता की जाँच करें",
    successMsg: "अनुरोध भेजा गया!",
    successSub: "हमारे काउंसलर आपको 24 घंटे के भीतर कॉल करेंगे।",
    search: "खोजें",
    colleges: "कॉलेज",
    exams: "परीक्षाएँ",
    scholarships: "स्कॉलरशिप",
    testSeries: "टेस्ट सीरीज़",
    contact: "संपर्क करें",
  },
};

type Translation = (typeof translations)["en"];

interface LanguageContextValue {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translation;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  // Remember the visitor's choice across visits.
  useEffect(() => {
    const saved = window.localStorage.getItem("govtdrish-lang");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore of the saved language preference
    if (saved === "en" || saved === "hi") setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("govtdrish-lang", lang);
  }, [lang]);

  const toggleLanguage = () => {
    setLang((prev) => (prev === "en" ? "hi" : "en"));
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang], toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used inside a LanguageProvider");
  }
  return context;
};
