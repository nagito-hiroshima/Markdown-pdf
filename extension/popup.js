const SAMPLE_URL = "https://github.com/nagito-hiroshima/Markdown-pdf/blob/main/samples/sample-document.md";

const urlInput = document.getElementById("urlInput");
const openButton = document.getElementById("openButton");
const currentButton = document.getElementById("currentButton");
const fileButton = document.getElementById("fileButton");
const sampleButton = document.getElementById("sampleButton");
const helpLink = document.getElementById("helpLink");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("status");

let activeTabUrl = "";

const setStatus = (message, alert = false) => {
  statusBox.textContent = message || "";
  statusBox.setAttribute("role", alert ? "alert" : "status");
};

const messageForValidation = (validation) => {
  if (validation?.reason === "github_not_markdown") return t("githubMarkdownRequired");
  if (validation?.errorCode === "INVALID_URL") return t("invalidUrl");
  return t("unsupportedMarkdownUrl");
};

const setLoading = (loading) => {
  openButton.disabled = loading;
  currentButton.disabled = loading || !UrlUtils.validateMarkdownUrl(activeTabUrl).ok;
  sampleButton.disabled = loading;
  openButton.textContent = loading ? t("loadingButton") : t("openPdfButton");
};

const openViewer = (params) => {
  const viewerUrl = new URL(chrome.runtime.getURL("viewer.html"));
  Object.entries(params).forEach(([key, value]) => viewerUrl.searchParams.set(key, value));
  chrome.tabs.create({ url: viewerUrl.toString() });
};

const openUrl = (rawUrl) => {
  const value = rawUrl.trim();
  if (!value) return setStatus(t("enterMarkdownUrl"), true);
  const validation = UrlUtils.validateMarkdownUrl(value);
  if (!validation.ok) return setStatus(messageForValidation(validation), true);
  setLoading(true);
  setStatus(t("openingMarkdown"));
  openViewer({ source: "url", url: validation.url });
  window.close();
};

const validateInput = () => {
  const value = urlInput.value.trim();
  if (!value) return setStatus("");
  const validation = UrlUtils.validateMarkdownUrl(value);
  setStatus(validation.ok ? t("supportedMarkdownUrl") : messageForValidation(validation), !validation.ok);
};

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  activeTabUrl = tab?.url || "";
  const validation = UrlUtils.validateMarkdownUrl(activeTabUrl);
  if (validation.ok) {
    urlInput.value = validation.url;
  } else if (activeTabUrl?.startsWith("https://github.com/")) {
    setStatus(messageForValidation(validation), true);
  }
  currentButton.disabled = !validation.ok;
});

urlInput.addEventListener("input", validateInput);
openButton.addEventListener("click", () => openUrl(urlInput.value));
currentButton.addEventListener("click", () => openUrl(activeTabUrl));
sampleButton.addEventListener("click", () => openUrl(SAMPLE_URL));
helpLink.addEventListener("click", (event) => {
  event.preventDefault();
  chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
});

fileButton.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;
  if (!/\.(md|markdown)$/i.test(file.name)) return setStatus(t("localMarkdownOnly"), true);
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    chrome.storage.local.set({ localMarkdown: { name: file.name, content: String(reader.result || ""), updatedAt: Date.now() } }, () =>
      openViewer({ source: "local" })
    );
  });
  reader.readAsText(file);
});
