import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRoutes from "./routes/auth.routes.js";
import protestRoutes from "./routes/protest.routes.js";

const app = express();

// Needed so `secure: true` cookies work correctly behind a platform's reverse
// proxy (Render, Railway, Fly, etc. all terminate TLS in front of your app).
app.set("trust proxy", 1);

app.use(helmet());

// CLIENT_URL can be a single origin or a comma-separated list. Keep the
// deployed frontend and local dev origin as safe defaults so a missing Render
// environment variable does not break browser requests after deployment.
const allowedOrigins = [
  "http://localhost:5173",
  "https://book-my-protest-123.vercel.app",
  ...(process.env.CLIENT_URL || "").split(","),
]
  .map((o) => o.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use("/api", limiter);

app.get("/api/health", (_req, res) => res.json({ success: true, message: "BookMyProtest API is up" }));

app.use("/api/auth", authRoutes);
app.use("/api/protests", protestRoutes);

app.use((_req, res) => res.status(404).json({ success: false, message: "Route not found" }));

// Centralized error handler — catches multer errors, zod throws, etc.
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(err.status || 500).json({ success: false, message: err.message || "Server error" });
});

export default app;
