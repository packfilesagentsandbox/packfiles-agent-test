import { Octokit } from "@octokit/rest";

let cached: Octokit | undefined;

export function getOctokit(): Octokit {
  if (cached) return cached;

  const token = process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
  if (!token) {
    throw new Error(
      "No GitHub token available. Set GITHUB_TOKEN (PAT for local dev; the Copilot Cloud Agent run injects this automatically in production).",
    );
  }

  cached = new Octokit({
    auth: token,
    userAgent: "packfiles-warp-mcp/0.0.1",
  });
  return cached;
}
