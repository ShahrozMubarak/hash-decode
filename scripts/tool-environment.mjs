import fs from "node:fs";
import path from "node:path";

export function loadDotEnvFiles(projectRoot) {
  const loaded = {};
  for (const fileName of [".env", ".env.local", ".dev.vars"]) {
    const filePath = path.join(projectRoot, fileName);
    if (!fs.existsSync(filePath)) continue;
    try {
      const content = fs.readFileSync(filePath, "utf8");
      for (const rawLine of content.split(/\r?\n/)) {
        const line = rawLine.trim();
        if (!line || line.startsWith("#")) continue;
        const eqIdx = line.indexOf("=");
        if (eqIdx <= 0) continue;
        const key = line.slice(0, eqIdx).trim().replace(/^export\s+/, "");
        let val = line.slice(eqIdx + 1).trim();
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
          val = val.slice(1, -1);
        }
        if (key) {
          loaded[key] = val;
          // NODE_ENV is owned by the build/dev command, never by dotenv files.
          // A development value here would make production builds emit jsxDEV.
          if (key !== "NODE_ENV") {
            if (process.env[key] === undefined || process.env[key] === "" || fileName === ".env.local") {
              if (val !== "" || process.env[key] === undefined) {
                process.env[key] = val;
              }
            }
          }
        }
      }
    } catch {
      // Ignore unreadable env files
    }
  }
  return loaded;
}

// Shared defaults for Vite and standalone Wrangler commands. Managed Linux
// supplies its own checkout-local paths before these defaults are applied.
export function configureToolEnvironment(projectRoot) {
  loadDotEnvFiles(projectRoot);

  const runtimeRoot =
    process.env.SITES_RUNTIME_ROOT || path.join(projectRoot, ".sites-runtime");
  const defaults = {
    CLOUDFLARE_CF_FETCH_ENABLED: "false",
    WRANGLER_SEND_METRICS: "false",
    WRANGLER_WRITE_LOGS: "false",
    WRANGLER_LOG_PATH: path.join(runtimeRoot, "wrangler/logs"),
    WRANGLER_REGISTRY_PATH: path.join(runtimeRoot, "wrangler/dev-registry"),
    MINIFLARE_REGISTRY_PATH: path.join(runtimeRoot, "wrangler/registry"),
  };
  for (const [name, value] of Object.entries(defaults)) {
    process.env[name] ??= value;
  }
}
