// Vercel serverless function entry point
// Imports the Express app (without starting the server) and exports it
// so Vercel can invoke it as a serverless handler
export { default } from "../artifacts/api-server/src/app";
