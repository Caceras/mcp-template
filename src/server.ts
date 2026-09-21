/**
 * Shared plumbing for every Host4AI MCP. You normally don't edit this file.
 * - Speaks "Streamable HTTP" at POST /mcp  (works in Claude + ChatGPT)
 * - GET /health  -> {"ok":true}             (used by the mcp.host4ai.se status page)
 * - Stateless: every request is handled independently (simple + robust)
 * - Security: the secret lives in the public URL path, enforced by Dokploy/Traefik
 */
import express from "express";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { registerTools } from "./tools.js";

const PORT = Number(process.env.PORT ?? 3000);
const NAME = process.env.MCP_NAME ?? "example";
const TITLE = process.env.MCP_TITLE ?? "Example MCP";
const VERSION = process.env.MCP_VERSION ?? "1.0.0";
const ICON_URL = process.env.MCP_ICON_URL || `https://mcp.host4ai.se/icons/${NAME}.png`;
const INSTRUCTIONS = process.env.MCP_INSTRUCTIONS;

function buildServer() {
  const server = new McpServer(
    {
      name: NAME,
      title: TITLE,
      version: VERSION,
      icons: [{ src: ICON_URL, mimeType: "image/png", sizes: ["256x256"] }],
    },
    INSTRUCTIONS ? { instructions: INSTRUCTIONS } : undefined,
  );
  registerTools(server);
  return server;
}

const app = express();
app.use(express.json({ limit: "4mb" }));

// Some clients only send "Accept: application/json"; the SDK wants both types listed.
app.use("/mcp", (req, _res, next) => {
  const a = req.headers.accept ?? "";
  if (!a.includes("text/event-stream") || !a.includes("application/json")) {
    req.headers.accept = "application/json, text/event-stream";
  }
  next();
});

app.post("/mcp", async (req, res) => {
  const server = buildServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined, // stateless
    enableJsonResponse: true,
  });
  res.on("close", () => {
    transport.close();
    server.close();
  });
  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (err) {
    console.error(err);
    if (!res.headersSent) {
      res.status(500).json({ jsonrpc: "2.0", error: { code: -32603, message: "Internal error" }, id: null });
    }
  }
});

// Stateless server: no server-initiated streams or sessions.
const notAllowed = (_req: express.Request, res: express.Response) =>
  res.status(405).set("Allow", "POST").json({ jsonrpc: "2.0", error: { code: -32000, message: "Method not allowed" }, id: null });
app.get("/mcp", notAllowed);
app.delete("/mcp", notAllowed);

app.get("/health", (_req, res) => res.json({ ok: true, name: NAME, version: VERSION }));

app.listen(PORT, () => console.log(`${TITLE} listening on :${PORT}/mcp`));
