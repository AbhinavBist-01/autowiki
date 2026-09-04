import { Router } from "express";
import { inngest } from "../inggest/client.js";
import { parseRepo } from "../service/github.js";

const router = Router();

router.post("/", async (req, res) => {
  const githubToken = req.body.githubToken || process.env.GITHUB_TOKEN;

  const { owner, repo, repoKey } = parseRepo(req.body.repo);

  await inngest.send({
    name: "repo/index.js.requested",
    data: { githubToken, owner, repo, repoKey },
  });
  res.json({ message: "Indexing requested" });
});
export { router as indexRoutes };
export default router;
