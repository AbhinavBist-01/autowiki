const SKIP_DIRS = [
  "node_modules",
  ".git",
  "dist",
  "build",
  "out",
  ".vscode",
  ".idea",
];

const SKIP_EXTENSIONS = new Set([
  ".png",
  ".jpg",
  ".jpeg",
  ".gif",
  ".svg",
  ".ico",
  ".pdf",
  ".zip",
  ".tar",
  ".gz",
  ".7z",
  ".mp3",
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".mkv",
  ".exe",
  ".dll",
  ".bin",
]);

const SKIP_FILES = new Set([
  ".DS_Store",
  "package-lock.json",
  "yarn.lock",
  "pnpm-lock.yaml",
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "composer.lock",
]);

function shouldSkipFile(path, size) {
  const parts = path.split("/");
  const fileName = parts[parts.length - 1];

  if (parts.some((part) => SKIP_DIRS.includes(part))) return true;
  if (SKIP_FILES.has(fileName)) return true;
  if (typeof size === "number" && size > 200000) return true;

  const ext = fileName.includes(".")
    ? fileName.slice(fileName.lastIndexOf(".") + 1).toLowerCase()
    : "";

  if (SKIP_EXTENSIONS.has(ext)) return true;
  if (fileName.endsWith(".min.js")) return true;

  return false;
}

export function parseRepo(input) {
  const clean = input
    .replace("https://github.com/", "")
    .replace("http://github.com/", "")
    .replace(/\.git$/, "");

  const [owner, repo] = clean.split("/");
  return { owner, repo, repoKey: `${owner}/${repo}` };
}
