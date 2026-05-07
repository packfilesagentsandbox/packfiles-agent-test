import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { strFromU8, unzipSync } from "fflate";
import { z } from "zod";
import { getOctokit } from "../github.js";

export function parseLogsZip(zipBuf: Uint8Array): string {
  const files = unzipSync(zipBuf, {
    filter: (f) => f.name.endsWith(".txt"),
  });
  const names = Object.keys(files).sort();
  return names
    .map((name) => `=== ${name} ===\n${strFromU8(files[name])}`)
    .join("\n");
}

export function registerGetRunLogs(server: McpServer): void {
  server.registerTool(
    "get_run_logs",
    {
      title: "Get Action run logs",
      description:
        "Downloads the logs from a GitHub Actions run on a Migration HQ repo and returns them as text (one section per log file in the run's zip, deterministically ordered by filename). Use this before diagnose_failure to inspect a failed Warp migration run.",
      inputSchema: {
        owner: z
          .string()
          .min(1)
          .describe("Repository owner (organization or user login)."),
        repo: z
          .string()
          .min(1)
          .describe("Repository name (typically 'Migration-HQ')."),
        run_id: z
          .number()
          .int()
          .positive()
          .describe("GitHub Actions run ID to fetch logs for."),
      },
    },
    async ({ owner, repo, run_id }) => {
      const octokit = getOctokit();
      const response = await octokit.rest.actions.downloadWorkflowRunLogs({
        owner,
        repo,
        run_id,
      });
      const buf = new Uint8Array(response.data as ArrayBuffer);
      return {
        content: [{ type: "text", text: parseLogsZip(buf) }],
      };
    },
  );
}
