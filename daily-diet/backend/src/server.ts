import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./env";
import { authRouter } from "./routes/auth.routes";
import { mealsRouter } from "./routes/meals.routes";
import { metricsRouter } from "./routes/metrics.routes";

const app = express();

app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true })); // 👈
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/meals", mealsRouter);
app.use("/api/metrics", metricsRouter);

app.listen(env.PORT, () => {
  console.log(`API on http://localhost:${env.PORT}`);
});
