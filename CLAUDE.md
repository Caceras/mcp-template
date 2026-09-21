# Recipe: build + deploy a new Host4AI MCP (for Claude)

Owner: Riki (GitHub `Caceras`). He is not a developer — do every step yourself with the GitHub,
Dokploy and Loopia connectors; only ask him to paste the final URL into Claude/ChatGPT.

1. **Repo**: create `Caceras/mcp-<name>` from template `Caceras/mcp-template`
   (public is fine: no secrets in code). In `docker-compose.yml` replace `REPO_NAME` with `mcp-<name>`.
2. **Tools**: write them in `src/tools.ts`. Prefix names with `<name>_`. Mark read-only tools
   `readOnlyHint: true`, destructive ones `destructiveHint: true`. API keys come from `process.env`.
3. **Test locally**: `npm install && npm run build && (node dist/server.js &) && npm test`.
4. **Deploy (Dokploy)**: project **mcp** → create *raw* compose, paste `docker-compose.yml`,
   set env (`MCP_NAME` = `<name>`, `MCP_TITLE`, any API keys), deploy.
   Domain: host `mcp.host4ai.se`, path `/<name>/<40-hex secret>`, `stripPath: true`,
   internal path `/`, port `3000`, service `mcp`, HTTPS + letsencrypt.
   Secret: `openssl rand -hex 20`. Never commit or show the secret publicly.
5. **Verify live**: `BASE=https://mcp.host4ai.se/<name>/<secret> npm test`.
6. **Directory** (`Caceras/mcp-hub`): add an entry to `registry.json` (id = `<name>`, name, mode,
   glyph = 2 letters, color, description), run `python3 scripts/make-icons.py`, commit.
   Add `"<name>": "<full /mcp URL>"` to the `MCP_URLS` env of Dokploy compose **mcp-hub**, redeploy it.
7. **Hand-off to Riki**: the URL is on https://mcp.host4ai.se/admin → Claude: Settings → Connectors →
   Add custom connector. ChatGPT: Settings → Apps → Create app, auth "No authentication",
   upload the icon ("Download icon" on the admin page).
8. **Update code later**: push to `main`, then redeploy the compose in Dokploy.
