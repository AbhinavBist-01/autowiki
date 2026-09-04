import { Octokit } from "@octokit/rest";

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
    ? fileName.slice(fileName.lastIndexOf(".")).toLowerCase()
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

export async function fetchRepoFiles(token, owner, repo) {
  const octokit = new Octokit({
    auth: token,
  });

  let repoInfo;
  try {
    const res = await octokit.rest.repos.get({ owner, repo });
    repoInfo = res.data;
  } catch (err) {
    if (err.status === 404) {
      throw new Error(`Github could not find ${owner}/${repo}`);
    }
    throw err;
  }

  const { data: treeData } = await octokit.rest.git.getTree({
    owner,
    repo,
    tree_sha: repoInfo.default_branch,
    recursive: true,
  });

  if (!treeData?.tree || !Array.isArray(treeData.tree)) {
    return [];
  }

  const files = [];

  for (const item of treeData.tree) {
    if (item.type !== "blob") continue;
    if (shouldSkipFile(item.path, item.size)) continue;

    try {
      const { data: blob } = await octokit.rest.git.getBlob({
        owner,
        repo,
        file_sha: item.sha,
      });

      files.push({
        path: item.path,
        content: Buffer.from(blob.content, "base64").toString("utf-8"),
      });
    } catch (err) {
      console.warn(`Failed to fetch blob for ${item.path}:`, err.message);
    }

    if (files.length >= 2000) break;
  }
  return files;
}
