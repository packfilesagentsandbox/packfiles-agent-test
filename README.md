# packfiles-agent-test

Stripped runtime copy of the Packfiles Warp MCP server, used to verify the GitHub Copilot Cloud Agent → MCP wire from a sandbox Migration HQ.

This is **not** the canonical source. It contains only the files needed for `npx` to install + run the server. Strategy docs, plans, and full README live in the private upstream repo.

## How it's used

Sandbox Migration HQ repos register this server in their Copilot Coding Agent settings via:

```json
{
  "mcpServers": {
    "packfiles-warp": {
      "type": "local",
      "command": "npx",
      "args": ["-y", "github:Packfiles-Sandbox/packfiles-agent-test#main"],
      "tools": ["*"]
    }
  }
}
```

The Cloud Agent run clones this repo, runs `npm install` (the `prepare` script builds `dist/`), then invokes the `packfiles-warp-mcp` binary on stdio.
