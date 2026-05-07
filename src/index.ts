#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDiagnoseFailure } from "./tools/diagnose_failure.js";
import { registerGetRunLogs } from "./tools/get_run_logs.js";
import { registerPing } from "./tools/ping.js";
import { registerSuggestFixes } from "./tools/suggest_fixes.js";

const server = new McpServer({
  name: "packfiles-warp-mcp",
  version: "0.1.0",
});

registerPing(server);
registerGetRunLogs(server);
registerDiagnoseFailure(server);
registerSuggestFixes(server);

const transport = new StdioServerTransport();
await server.connect(transport);

process.stderr.write("packfiles-warp-mcp v0.1.0 running on stdio\n");
