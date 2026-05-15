// Vercel serverless entry — exports the pre-built Express app bundle.
// Uses createRequire so the .mjs bundle is resolved relative to this file.
import { createRequire } from "module";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Dynamically import the pre-built serverless bundle
const { default: app } = await import(
  path.join(__dirname, "../artifacts/api-server/dist/serverless.mjs")
);

export default app;
