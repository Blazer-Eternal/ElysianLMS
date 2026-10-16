import app from "./app";
import { allowedOrigins, environment, port } from "./config";
import { Database } from "./config/dbInstance";

const PORT = Number(port) || 5000;

// CORS policy is defined in config/cors.ts and applied to every response by
// app.ts. This is the startup guard: it reports the active allow-list and
// fails loudly when production is misconfigured instead of silently blocking
// the frontend at runtime.
const reportCors = () => {
  if (allowedOrigins.length === 0) {
    if (environment === "production") {
      console.warn(
        "[cors] CLIENT_URL is not set — no browser origin is allowed. " +
          "Set CLIENT_URL (comma-separated) in .env before serving a frontend."
      );
    }
    return;
  }
  console.log(`[cors] allowed origins: ${allowedOrigins.join(", ")}`);
};

const start = async () => {
  await Database.connection();
  reportCors();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();
