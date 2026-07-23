(function (global) {
  const MARKDOWN_EXT_RE = /\.(md|markdown)$/i;
  const GITHUB_HOST = "github.com";
  const RAW_GITHUB_HOST = "raw.githubusercontent.com";

  const parseUrl = (value) => {
    try {
      return new URL(String(value || ""));
    } catch {
      return null;
    }
  };

  const hasCredentials = (url) => Boolean(url.username || url.password);
  const isHttpUrl = (url) => url?.protocol === "http:" || url?.protocol === "https:";
  const hasMarkdownExtension = (url) => MARKDOWN_EXT_RE.test(url?.pathname || "");

  const isGithubMarkdownBlobUrl = (value) => {
    const url = parseUrl(value);
    if (!url || url.hostname !== GITHUB_HOST || !isHttpUrl(url) || hasCredentials(url)) return false;
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length >= 5 && parts[2] === "blob" && hasMarkdownExtension(url);
  };

  const isGithubRawMarkdownUrl = (value) => {
    const url = parseUrl(value);
    return Boolean(
      url &&
        url.hostname === RAW_GITHUB_HOST &&
        url.protocol === "https:" &&
        !hasCredentials(url) &&
        hasMarkdownExtension(url)
    );
  };

  const githubBlobToRawUrl = (value) => {
    if (!isGithubMarkdownBlobUrl(value)) return value;
    const url = parseUrl(value);
    const [owner, repo, , branch, ...path] = url.pathname.split("/").filter(Boolean);
    return `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path.join("/")}`;
  };

  const isSupportedMarkdownUrl = (value) => validateMarkdownUrl(value).ok;

  const validateMarkdownUrl = (value) => {
    const url = parseUrl(value);
    if (!url) return { ok: false, errorCode: "INVALID_URL" };
    if (!isHttpUrl(url)) return { ok: false, errorCode: "UNSUPPORTED_URL" };
    if (hasCredentials(url)) return { ok: false, errorCode: "INVALID_URL" };

    if (url.hostname === GITHUB_HOST) {
      if (isGithubMarkdownBlobUrl(url.toString())) {
        return { ok: true, url: githubBlobToRawUrl(url.toString()), originalUrl: url.toString(), sourceType: "github_blob" };
      }
      return { ok: false, errorCode: "UNSUPPORTED_URL", reason: "github_not_markdown" };
    }

    if (url.hostname === RAW_GITHUB_HOST) {
      return isGithubRawMarkdownUrl(url.toString())
        ? { ok: true, url: url.toString(), originalUrl: url.toString(), sourceType: "github_raw" }
        : { ok: false, errorCode: "UNSUPPORTED_URL" };
    }

    return { ok: true, url: url.toString(), originalUrl: url.toString(), sourceType: "generic_http" };
  };

  const api = {
    isSupportedMarkdownUrl,
    isGithubMarkdownBlobUrl,
    isGithubRawMarkdownUrl,
    githubBlobToRawUrl,
    validateMarkdownUrl
  };

  if (typeof module !== "undefined" && module.exports) module.exports = api;
  global.UrlUtils = api;
})(typeof globalThis !== "undefined" ? globalThis : window);
