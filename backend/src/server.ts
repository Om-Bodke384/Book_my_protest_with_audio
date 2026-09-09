import "dotenv/config";
import app from "./app.js";
import { pool } from "./db/index.js";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`BookMyProtest API running on port ${PORT}`);
});

function shutdown(signal: string) {
  console.log(`${signal} received: closing server gracefully`);
  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
