const t = (key, substitutions) => {
  if (!globalThis.chrome?.i18n?.getMessage) return key;
  return chrome.i18n.getMessage(key, substitutions) || key;
};

const localizeDocument = () => {
  document.documentElement.lang = chrome.i18n.getUILanguage().startsWith("ja") ? "ja" : "en";

  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = t(element.dataset.i18n);
  });

  document.querySelectorAll("[data-i18n-title]").forEach((element) => {
    element.title = t(element.dataset.i18nTitle);
  });

  document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
    element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
  });
};

localizeDocument();
