importScripts("url-utils.js");

const MAX_MARKDOWN_BYTES = 10 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 15000;
const TEXT_MARKDOWN_TYPES = ["text/markdown", "text/plain", "text/x-markdown", "application/octet-stream"];

const error = (errorCode, message, details = {}) => ({ ok: false, errorCode, message, ...details });

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason === "install") {
    chrome.tabs.create({ url: chrome.runtime.getURL("onboarding.html") });
  }
});

const isLikelyMarkdownResponse = (url, contentType) => {
  const type = String(contentType || "").split(";")[0].trim().toLowerCase();
  if (type === "text/html" || type === "application/xhtml+xml") return false;
  if (UrlUtils.isGithubRawMarkdownUrl(url)) return true;
  if (/\.(md|markdown)$/i.test(new URL(url).pathname)) return true;
  return !type || TEXT_MARKDOWN_TYPES.includes(type) || type.startsWith("text/");
};

const fetchMarkdown = async (targetUrl) => {
  const validation = UrlUtils.validateMarkdownUrl(targetUrl);
  if (!validation.ok) return error(validation.errorCode, "Unsupported Markdown URL.");

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(validation.url, {
      credentials: "omit",
      redirect: "follow",
      signal: controller.signal
    });

    const finalValidation = UrlUtils.validateMarkdownUrl(response.url);
    if (!finalValidation.ok) return error("UNSUPPORTED_URL", "Redirected to an unsupported URL.", { finalUrl: response.url });

    if (response.status === 404) return error("NOT_FOUND", "Markdown file was not found.", { status: response.status, finalUrl: response.url });
    if (response.status === 401 || response.status === 403) {
      return error("ACCESS_DENIED", "Access to this file is denied.", { status: response.status, finalUrl: response.url });
    }
    if (!response.ok) return error("HTTP_ERROR", `HTTP error ${response.status}.`, { status: response.status, finalUrl: response.url });

    const contentType = response.headers.get("content-type") || "";
    if (!isLikelyMarkdownResponse(response.url, contentType)) {
      return error("NOT_MARKDOWN", "The response was a web page, not Markdown.", { finalUrl: response.url, contentType });
    }

    const contentLength = Number(response.headers.get("content-length") || 0);
    if (contentLength > MAX_MARKDOWN_BYTES) return error("TOO_LARGE", "Markdown file is too large.", { finalUrl: response.url });

    const reader = response.body?.getReader();
    if (!reader) {
      const markdown = await response.text();
      if (new TextEncoder().encode(markdown).length > MAX_MARKDOWN_BYTES) return error("TOO_LARGE", "Markdown file is too large.");
      return { ok: true, markdown, finalUrl: response.url, contentType };
    }

    const chunks = [];
    let received = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      received += value.byteLength;
      if (received > MAX_MARKDOWN_BYTES) {
        controller.abort();
        return error("TOO_LARGE", "Markdown file is too large.", { finalUrl: response.url });
      }
      chunks.push(value);
    }
    const markdown = new TextDecoder("utf-8").decode(new Blob(chunks).stream ? await new Blob(chunks).arrayBuffer() : chunks[0]);
    return { ok: true, markdown, finalUrl: response.url, contentType };
  } catch (err) {
    return error(err?.name === "AbortError" ? "TIMEOUT" : "NETWORK_ERROR", err?.message || "Network error.");
  } finally {
    clearTimeout(timeoutId);
  }
};

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "openViewer") {
    const validation = UrlUtils.validateMarkdownUrl(message.url);
    if (!validation.ok) return false;
    const viewerUrl = new URL(chrome.runtime.getURL("viewer.html"));
    viewerUrl.searchParams.set("source", "url");
    viewerUrl.searchParams.set("url", validation.url);
    if (message.print) viewerUrl.searchParams.set("print", "1");
    chrome.tabs.create({ url: viewerUrl.toString() });
    return false;
  }

  if (message?.type === "fetchMarkdown") {
    fetchMarkdown(message.url).then(sendResponse);
    return true;
  }
  return false;
});
