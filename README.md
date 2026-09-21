# Host4AI MCP template

Starter kit for a new MCP server (a small web service that gives Claude and ChatGPT new tools).
Every MCP built from this works in **both Claude (Connectors) and ChatGPT (Plugins)**.

## What's inside

| File | What it is |
|---|---|
| `src/tools.ts` | ✏️ **The only file you normally edit** — the tools the AI can use |
| `src/server.ts` | Shared plumbing (MCP endpoint, health check, icon). Don't touch |
| `Dockerfile` | Packaging recipe Dokploy uses to run it |
| `docker-compose.yml` | How Dokploy builds it straight from GitHub |
| `test/smoke.mjs` | Automatic check that the server works |
| `CLAUDE.md` | Step-by-step recipe for Claude to build + deploy a new MCP |

## How a new MCP gets made

Ask Claude: *"Build me an MCP for X."* Claude follows `CLAUDE.md`:
1. New repo from this template → writes tools in `src/tools.ts` → tests
2. Deploys in Dokploy (project **mcp**) at `https://mcp.host4ai.se/<name>/<secret>/mcp`
3. Adds it to the directory at **https://mcp.host4ai.se**
4. You paste the URL into Claude + ChatGPT, and upload the icon in ChatGPT

## Endpoints

- `POST /mcp` — the MCP itself (Streamable HTTP, stateless)
- `GET /health` — returns `{"ok":true}`
