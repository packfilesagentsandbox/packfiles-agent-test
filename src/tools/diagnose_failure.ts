import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export type FingerprintId = "azure_pipelines_service_connection_missing";

export type DiagnoseResult =
  | {
      fingerprint: FingerprintId;
      description: string;
    }
  | {
      fingerprint: null;
      description: "No known failure fingerprint matched. Escalate to a human reviewer.";
    };

type Fingerprint = {
  readonly id: FingerprintId;
  readonly description: string;
  readonly matches: (logs: string) => boolean;
};

const ACTIONS_ERROR = /##\[error\]|::error::/;
const SERVICE_CONNECTION_FIELD = /azure_pipelines_github_app_service_connection_id/;

const FINGERPRINTS: readonly Fingerprint[] = [
  {
    id: "azure_pipelines_service_connection_missing",
    description:
      "Azure DevOps pipeline rewire failed because azure_pipelines_github_app_service_connection_id is not set in config/warp.yml. The rewire job needs this UUID to authenticate against Azure DevOps when updating a pipeline's service connection.",
    matches: (logs) =>
      ACTIONS_ERROR.test(logs) && SERVICE_CONNECTION_FIELD.test(logs),
  },
];

export function diagnose(logs: string): DiagnoseResult {
  for (const fp of FINGERPRINTS) {
    if (fp.matches(logs)) {
      return { fingerprint: fp.id, description: fp.description };
    }
  }
  return {
    fingerprint: null,
    description: "No known failure fingerprint matched. Escalate to a human reviewer.",
  };
}

export function registerDiagnoseFailure(server: McpServer): void {
  server.registerTool(
    "diagnose_failure",
    {
      title: "Diagnose Warp migration failure",
      description:
        "Classify a failed Warp migration run by matching its log text against known failure fingerprints. Returns a deterministic fingerprint ID that suggest_fixes consumes, or null if no known pattern matches. Call after get_run_logs.",
      inputSchema: {
        logs: z
          .string()
          .min(1)
          .describe(
            "Full text of the failed Action run logs (output of get_run_logs).",
          ),
      },
    },
    async ({ logs }) => {
      const result = diagnose(logs);
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    },
  );
}
