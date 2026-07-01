const urlInput = document.getElementById("urlInput");
const openButton = document.getElementById("openButton");
const currentButton = document.getElementById("currentButton");
const fileButton = document.getElementById("fileButton");
const fileInput = document.getElementById("fileInput");
const statusBox = document.getElementById("status");

const setStatus = (message) => {
  statusBox.textContent = message || "";
};

const githubBlobToRaw = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return url;
    const parts = parsed.pathname.split("/").filter(Boolean);
    const blobIndex = parts.indexOf("blob");
    if (parts.length < 5 || blobIndex !== 2) return url;
    const [owner, repo] = parts;
    const branch = parts[3];
    const path = parts.slice(4).join("/");
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
  } catch {
    return url;
  }
};

const openViewer = (params) => {
  const viewerUrl = new URL(chrome.runtime.getURL("viewer.html"));
  Object.entries(params).forEach(([key, value]) => viewerUrl.searchParams.set(key, value));
  chrome.tabs.create({ url: viewerUrl.toString() });
};

const openUrl = (rawUrl) => {
  const value = rawUrl.trim();
  if (!value) {
    setStatus(t("enterMarkdownUrl"));
    return;
  }

  let parsed;
  try {
    parsed = new URL(value);
  } catch {
    setStatus(t("invalidUrl"));
    return;
  }

  const targetUrl = githubBlobToRaw(parsed.toString());
  openViewer({ source: "url", url: targetUrl });
};

chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  if (tab?.url) urlInput.value = githubBlobToRaw(tab.url);
});

openButton.addEventListener("click", () => openUrl(urlInput.value));

currentButton.addEventListener("click", () => {
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    openUrl(tab?.url || "");
  });
});

fileButton.addEventListener("click", () => fileInput.click());

fileInput.addEventListener("change", () => {
  const file = fileInput.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    chrome.storage.local.set(
      {
        localMarkdown: {
          name: file.name,
          content: String(reader.result || ""),
          updatedAt: Date.now()
        }
      },
      () => openViewer({ source: "local" })
    );
  });
  reader.readAsText(file);
});
