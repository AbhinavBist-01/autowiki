import { inngest } from "../client.js";
import { fetchRepoFiles } from "../../service/github.js";
import { chunkFiles } from "../../service/chunker.js";
import { saveChunks } from "../../service/vector-store.js";

export const indexRepo = inngest.createFunction(
  { id: "index-repo", triggers: [{ event: "repo/index.js.requested" }] },
  async ({ event, step }) => {
    const githubToken = event.data.githubToken || process.env.GITHUB_TOKEN;
    let owner = event.data.owner;
    let repo = event.data.repo;

    if (!repo && event.data.repoKey) {
      const parts = event.data.repoKey.split("/");
      owner = owner || parts[0];
      repo = parts[1];
    }

    if (!repo) {
      throw new Error(`Invalid event data: missing repository name. Received: ${JSON.stringify(event.data)}`);
    }

    const repoName = repo.replace(/\.git$/, "");
    const repoKey = event.data.repoKey || `${owner}/${repoName}`;

    const files = await step.run("fetch-repo-files", async () => {
      return fetchRepoFiles(githubToken, owner, repoName);
    });

    const documents = await step.run("chunk-files", async () => {
      return chunkFiles(files, repoKey);
    });

    if (documents.length > 0) {
      await step.run("save-to-pinecone", async () => {
        return saveChunks(repoKey, documents);
      });
    }

    return {
      repo: repoKey,
      fileCount: files.length,
      chunkCount: documents.length,
    };
  },
);
