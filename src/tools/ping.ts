import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

export function registerPing(server: McpServer): void {
  server.registerTool(
    "ping",
    {
      title: "Ping",
      description:
        "Health check. Echoes the Migration HQ issue number back so we can confirm the agent runtime can reach this MCP server. Use first when verifying setup.",
      inputSchema: {
        issue_number: z
          .number()
          .int()
          .positive()
          .describe("Issue number from the Migration HQ repo to echo back."),
      },
    },
    async ({ issue_number }) => ({
      content: [
        {
          type: "text",
          text: `pong! received issue_number=${issue_number}. packfiles-warp-mcp v0.1.0 is alive.`,
        },
      ],
    }),
  );
}
