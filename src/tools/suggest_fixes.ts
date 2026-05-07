import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import type { FingerprintId } from "./diagnose_failure.js";

const COMMENTED_AZURE_DEVOPS_BLOCK = /^# azure_devops:\n((?:^# .*\n?)*)/m;

export function applyFix(
  fingerprint: FingerprintId,
  warpYml: string,
): string {
  switch (fingerprint) {
    case "azure_pipelines_service_connection_missing":
      return warpYml.replace(COMMENTED_AZURE_DEVOPS_BLOCK, (_, body: string) => {
        const uncommented = body.replace(/^# /gm, "");
        return `azure_devops:\n${uncommented}`;
      });
  }
}

export function registerSuggestFixes(server: McpServer): void {
  server.registerTool(
    "suggest_fixes",
    {
      title: "Suggest a warp.yml fix",
      description:
        "Apply a deterministic fix for a known failure fingerprint and return the full updated config/warp.yml content. The agent uses this to draft a PR. Returns the entire file body — not a diff — because diff fragments tokenize fragilely through LLMs. Same fingerprint + same input always produces the same output.",
      inputSchema: {
        fingerprint: z
          .enum(["azure_pipelines_service_connection_missing"])
          .describe("Fingerprint ID returned by diagnose_failure."),
        warp_yml: z
          .string()
          .min(1)
          .describe(
            "Current contents of config/warp.yml from the Migration HQ repo.",
          ),
      },
    },
    async ({ fingerprint, warp_yml }) => {
      const fixed = applyFix(fingerprint, warp_yml);
      return {
        content: [{ type: "text", text: fixed }],
      };
    },
  );
}
