const SAMPLE_URL = "https://github.com/nagito-hiroshima/Markdown-pdf/blob/main/samples/sample-document.md";
const labels = {
  ja: { onboardingTitle:"Markdownを印刷しやすいPDF風ページに変換します。", onboardingIntro:"GitHub上のMarkdown、URL、ローカルファイルを開き、印刷画面からPDFとして保存できます。", onboardingStepsTitle:"使い方", onboardingStepGithub:"GitHub上の.mdまたは.markdownファイルを開きます。", onboardingStepButton:"ページに表示される「PDF表示」ボタンを押します。", onboardingStepPopup:"拡張機能アイコンからURLやローカルファイルも開けます。", onboardingStepPrint:"印刷画面からPDFとして保存できます。", openSampleButton:"サンプルを開く", getStartedButton:"使い始める" },
  en: { onboardingTitle:"Turn Markdown into a printable PDF-style page.", onboardingIntro:"Open GitHub Markdown, URL Markdown, or a local file and save it as PDF from the print screen.", onboardingStepsTitle:"How to use", onboardingStepGithub:"Open a .md or .markdown file on GitHub.", onboardingStepButton:"Press the PDF View button shown on the page.", onboardingStepPopup:"You can also open URLs and local files from the extension icon.", onboardingStepPrint:"Use the print screen to save as PDF.", openSampleButton:"Open Sample", getStartedButton:"Get started" }
};
const applyLanguage = (lang) => {
  const selected = labels[lang] ? lang : "en";
  document.documentElement.lang = selected;
  document.querySelectorAll("[data-i18n]").forEach((element) => {
    element.textContent = labels[selected][element.dataset.i18n] || t(element.dataset.i18n);
  });
};
const openViewer = (url) => {
  const validation = UrlUtils.validateMarkdownUrl(url);
  const viewerUrl = new URL(chrome.runtime.getURL("viewer.html"));
  viewerUrl.searchParams.set("source", "url");
  viewerUrl.searchParams.set("url", validation.ok ? validation.url : url);
  chrome.tabs.create({ url: viewerUrl.toString() });
};
document.getElementById("sampleButton").addEventListener("click", () => openViewer(SAMPLE_URL));
document.getElementById("startButton").addEventListener("click", () => window.close());
document.getElementById("jaButton").addEventListener("click", () => applyLanguage("ja"));
document.getElementById("enButton").addEventListener("click", () => applyLanguage("en"));
applyLanguage(chrome.i18n.getUILanguage().startsWith("ja") ? "ja" : "en");
