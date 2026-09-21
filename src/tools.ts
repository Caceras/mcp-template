/**
 * ✏️  THIS IS THE ONLY FILE YOU NORMALLY EDIT.
 *
 * Each `server.registerTool(...)` block is one tool the AI (Claude or ChatGPT) can use.
 * - name:        short, lowercase, prefixed with the MCP name (e.g. "weather_get_forecast")
 * - description: plain words telling the AI WHEN to use it
 * - inputSchema: what the AI must send (checked automatically)
 * - annotations: tells the AI if the tool only reads, or changes things
 */
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export function registerTools(server: McpServer) {
  server.registerTool(
    "example_echo",
    {
      title: "Echo (example)",
      description:
        "Example tool. Returns the text you send, plus the server time. Replace this with real tools.",
      inputSchema: { text: z.string().describe("Any text, e.g. 'hello'") },
      annotations: { readOnlyHint: true, openWorldHint: false },
    },
    async ({ text }) => {
      const result = { echo: text, serverTime: new Date().toISOString() };
      return {
        content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
        structuredContent: result,
      };
    },
  );
}
