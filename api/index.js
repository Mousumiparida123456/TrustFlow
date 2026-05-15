// Vercel serverless entry — loads the pre-built CJS Express bundle.
// Using require() so @vercel/node (ncc) can statically resolve and package the file.
const { default: app } = require("../artifacts/api-server/dist/serverless.cjs");
module.exports = app;
