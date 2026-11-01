
const GITHUB_USER = "rd6260";
const GITHUB_REPO = "mindrain";
const GITHUB_BRANCH = "main";

const CDN_BASE = `https://cdn.jsdelivr.net/gh/${GITHUB_USER}/${GITHUB_REPO}@${GITHUB_BRANCH}`;

export function getCdnUrl(filePath: string): string {
  const path = filePath
    .replace(/^\/+/, "")
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `${CDN_BASE}/${path}`;
}

