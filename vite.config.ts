import vinext from "vinext";
import { defineConfig } from "vite";
import hostingConfig from "./.openai/hosting.json";
import { readExecutionProfile } from "./scripts/execution-profile.mjs";
import { configureToolEnvironment } from "./scripts/tool-environment.mjs";
import { sites } from "./scripts/vite/sites-vite-plugin";
import { connectorPreview } from "./scripts/vite/connector-preview-plugin.mjs";

const SITE_CREATOR_PLACEHOLDER_DATABASE_ID =
  "00000000-0000-4000-8000-000000000000";

const { d1, r2 } = hostingConfig;

// macOS Seatbelt blocks FSEvents, so Codex previews need polling for HMR.
const isCodexSeatbeltSandbox = process.env.CODEX_SANDBOX === "seatbelt";
const managedLinux = readExecutionProfile() === "managed-linux";

const FORWARDED_ENV_KEYS = [
  "MONGODB_URI",
  "MONGO_URI",
  "MONGODB_URL",
  "MONGODB_DB_NAME",
  "OWNER_PASSWORD_HASH",
  "ADMIN_PASSWORD",
  "ADMIN_EMAIL",
  "STUDIO_OWNER_EMAIL",
  "ADMIN_NOTIFICATION_EMAIL",
  "RESEND_API_KEY",
  "MAIL_FROM",
  "MAIL_TO",
  "TURNSTILE_SITE_KEY",
  "TURNSTILE_SECRET",
  "SITE_ORIGIN",
  "SERVICE_AREA",
];

function collectRuntimeVars(): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const key of FORWARDED_ENV_KEYS) {
    const val = process.env[key];
    if (typeof val === "string" && val.trim() !== "") {
      vars[key] = val.trim();
    }
  }
  return vars;
}

export default defineConfig(async ({ command }) => {
  configureToolEnvironment(process.cwd());

  const runtimeVars = command === "serve" ? collectRuntimeVars() : {};

  const localBindingConfig = {
    main: "./worker/index.ts",
    compatibility_flags: ["nodejs_compat"],
    ...(Object.keys(runtimeVars).length > 0 ? { vars: runtimeVars } : {}),
    d1_databases: d1
      ? [
          {
            binding: d1,
            database_name: "site-creator-d1",
            database_id: process.env.D1_DATABASE_ID || SITE_CREATOR_PLACEHOLDER_DATABASE_ID,
            migrations_dir: "drizzle",
          },
        ]
      : [],
    r2_buckets: r2
      ? [
          {
            binding: r2,
            bucket_name: "site-creator-r2",
          },
        ]
      : [],
  };

  // Wrangler snapshots its log path while the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    define: { "import.meta.env.VITE_STUDIO_RELEASE": JSON.stringify(crypto.randomUUID()) },
    server: {
      ...(managedLinux
        ? { host: "0.0.0.0", allowedHosts: ["terminal.local"] }
        : {}),
      ...(isCodexSeatbeltSandbox
        ? { watch: { useFsEvents: false, usePolling: true } }
        : {}),
    },
    plugins: [
      vinext(),
      sites(),
      connectorPreview(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        inspectorPort: false,
        config: {
          ...localBindingConfig,
          ...(command === "serve"
            ? {
                services: [
                  {
                    binding: "CONNECTORS",
                    service: "sites-connector-preview",
                    entrypoint: "ConnectorPreview",
                  },
                ],
              }
            : {}),
        },
        ...(command === "serve"
          ? {
              auxiliaryWorkers: [
                {
                  config: {
                    name: "sites-connector-preview",
                    main: "./scripts/connector-preview/worker.mjs",
                    compatibility_date: "2026-05-15",
                  },
                },
              ],
            }
          : {}),
      }),
    ],
  };
});
