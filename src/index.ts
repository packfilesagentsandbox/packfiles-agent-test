#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerPing } from "./tools/ping.js";

const server = new McpServer({
  name: "packfiles-warp-mcp",
  version: "0.0.1",
});

registerPing(server);

const transport = new StdioServerTransport();
await server.connect(transport);

process.stderr.write("packfiles-warp-mcp v0.0.1 running on stdio\n");
