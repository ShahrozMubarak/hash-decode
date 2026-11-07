import {fileURLToPath} from "node:url";
import {readExecutionProfile} from "./execution-profile.mjs";
const [command,...args]=process.argv.slice(2);
if(!["dev","build"].includes(command))throw Error("Expected dev or build.");

if (process.env.VERCEL && command === "build") {
  const cli = new URL("../node_modules/next/dist/bin/next", import.meta.url);
  process.argv = [process.execPath, fileURLToPath(cli), "build", ...args];
  await import(cli.href);
} else {
  const cli=new URL("../node_modules/vite/bin/vite.js",import.meta.url);
  const devPort=command==="dev" && readExecutionProfile()!=="managed-linux" && !args.includes("--port")?["--port","5173"]:[];
  process.argv=[process.execPath,fileURLToPath(cli),command,...devPort,...args];
  await import(cli.href);
}
