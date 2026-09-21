// Smoke test: checks a running server (default http://localhost:3000).
// Usage: npm test            or   BASE=https://mcp.host4ai.se/<name>/<secret> npm test
const BASE = process.env.BASE ?? "http://localhost:3000";
const post = async (body, accept = "application/json, text/event-stream") => {
  const r = await fetch(`${BASE}/mcp`, { method: "POST", headers: { "content-type": "application/json", accept }, body: JSON.stringify(body) });
  const t = await r.text();
  const json = t.startsWith("event:") ? JSON.parse(t.split("data: ")[1]) : JSON.parse(t);
  return { status: r.status, json };
};
const fail = (m) => { console.error("❌", m); process.exit(1); };

const init = await post({ jsonrpc: "2.0", id: 1, method: "initialize", params: { protocolVersion: "2025-11-25", capabilities: {}, clientInfo: { name: "smoke", version: "1" } } });
if (init.status !== 200) fail(`initialize status ${init.status}`);
const info = init.json.result.serverInfo;
if (!info.icons?.length) fail("no icons in serverInfo");
console.log("✅ initialize:", info.name, info.version, "icon:", info.icons[0].src);

const jsonOnly = await post({ jsonrpc: "2.0", id: 2, method: "tools/list" }, "application/json");
if (jsonOnly.status !== 200) fail(`JSON-only client rejected (${jsonOnly.status})`);
const tools = jsonOnly.json.result.tools;
if (!tools.length) fail("no tools");
console.log("✅ tools/list (JSON-only client):", tools.map((t) => t.name).join(", "));

if (!process.env.BASE?.startsWith("https")) {
  const h = await fetch(`${BASE}/health`).then((r) => r.json());
  if (!h.ok) fail("health not ok");
  console.log("✅ /health ok");
}
console.log("🎉 all checks passed");
