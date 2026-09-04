import { Router } from "express";
import { inngest } from "../inggest/client.js";
import { parseRepo } from "../service/github.js";

const router = Router();

router.post("/", async (req, res) => {
  const githubToken = req.body.githubToken || process.env.GITHUB_TOKEN;

  let { owner, repo, repoKey } = req.body;

  if (!owner && repo) {
    const parsed = parseRepo(repo);
    owner = parsed.owner;
    repo = parsed.repo;
    repoKey = repoKey || parsed.repoKey;
  } else if (owner && repo && !repoKey) {
    repoKey = `${owner}/${repo}`;
  }

  if (!owner || !repo) {
    return res.status(400).json({
      error: "Missing repository information. Please provide 'owner' and 'repo', or a valid 'repo' URL/path.",
    });
  }

  await inngest.send({
    name: "repo/index.js.requested",
    data: { githubToken, owner, repo, repoKey },
  });
  res.json({ message: "Indexing requested", repoKey });
});
export { router as indexRoutes };
export default router;
