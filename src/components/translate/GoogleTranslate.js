import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

const GoogleTranslate = () => {
  const location = useLocation();
  const [selectedLanguage, setSelectedLanguage] = useState(
    localStorage.getItem("selectedLanguage") || "en"
  );

  // Function to apply the selected language
  const applySavedLanguage = () => {
    const savedLang = localStorage.getItem("selectedLanguage") || "en";
    const selectField = document.querySelector(".goog-te-combo");

    if (selectField) {
      // Remove unwanted languages
      [...selectField.options].forEach((option) => {
        if (!["en", "ar"].includes(option.value)) {
          option.remove(); // Remove all languages except English and Arabic
        }
      });

      selectField.value = savedLang;
      selectField.dispatchEvent(new Event("change", { bubbles: true }));
    }
  };

  useEffect(() => {
    const loadGoogleTranslate = () => {
      if (!window.googleTranslateLoaded) {
        const script = document.createElement("script");
        script.src =
          "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        script.onload = () => {
          window.googleTranslateElementInit = () => {
            new window.google.translate.TranslateElement(
              { pageLanguage: "en", autoDisplay: false },
              "google_translate_element"
            );
            applySavedLanguage();

            // Hide Google Translate's dropdown and restrict options
            setTimeout(() => {
              const googleSelect = document.querySelector(".goog-te-combo");
              if (googleSelect) {
                googleSelect.style.display = "none"; // Hide the dropdown
                applySavedLanguage(); // Ensure only English & Arabic
              }
            }, 1000);
          };
          window.googleTranslateElementInit();
        };
        document.body.appendChild(script);
        window.googleTranslateLoaded = true;
      } else {
        applySavedLanguage();
      }
    };

    loadGoogleTranslate();
  }, []);

  // Reapply translation on route change
  useEffect(() => {
    setTimeout(() => {
      applySavedLanguage();
    }, 500);
  }, [location.pathname]);

  // Handle language selection
  const handleLanguageChange = (lang) => {
    if (lang !== selectedLanguage) {
      localStorage.setItem("selectedLanguage", lang);
      setSelectedLanguage(lang);
      window.location.reload(); // Force full page reload to apply translation
    }
  };

  return (
    <div>
      {/* Hidden Google Translate Element */}
      <div id="google_translate_element" style={{ display: "none" }}></div>

      {/* Language Selector */}
      <ul>
        <li
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => handleLanguageChange("en")}
          className="notranslate"
        >
          English
        </li>
        <li
          style={{ cursor: "pointer", userSelect: "none" }}
          onClick={() => handleLanguageChange("ar")}
          className="notranslate"
        >
          Arabic
        </li>
      </ul>
    </div>
  );
};

export default GoogleTranslate;
