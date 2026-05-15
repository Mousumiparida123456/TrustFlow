// Vercel serverless entry — imports the pre-built Express bundle.
// Plain JavaScript: Vercel does NOT run TypeScript compilation on .js files.
import app from "../artifacts/api-server/dist/serverless.mjs";
export default app;
